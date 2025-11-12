import { Campaign, Customer } from '@/lib/types';
import { CampaignUI, CustomerUI } from '@/lib/ui-types';
import { transformDatabaseResponse } from '@/lib/property-transform';
import { SMSService, CampaignCustomer, createSMSService } from '@/lib/sms';

export interface CampaignJob {
  id: string;
  campaignId: string;
  user_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  progress: number; // 0-100
}

export interface CampaignQueue {
  enqueue(campaign: Campaign, customers: Customer[]): Promise<CampaignJob>;
  dequeue(): Promise<CampaignJob | null>;
  getJob(jobId: string): Promise<CampaignJob | null>;
  getJobs(user_id: string, status?: CampaignJob['status']): Promise<CampaignJob[]>;
  processJob(jobId: string): Promise<void>;
  pauseJob(jobId: string): Promise<void>;
  resumeJob(jobId: string): Promise<void>;
  cancelJob(jobId: string): Promise<void>;
  retryFailedJob(jobId: string): Promise<void>;
}

export class InMemoryCampaignQueue implements CampaignQueue {
  private jobs: Map<string, CampaignJob> = new Map();
  private processing = false;
  private smsService: SMSService;

  constructor() {
    this.smsService = createSMSService();
  }

  async enqueue(campaign: Campaign, customers: Customer[]): Promise<CampaignJob> {
    const job: CampaignJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      campaignId: campaign.id,
      user_id: campaign.user_id,
      status: 'pending',
      scheduledAt: campaign.scheduled_at ? new Date(campaign.scheduled_at) : new Date(),
      totalRecipients: customers.length,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      retryCount: 0,
      maxRetries: 3,
      progress: 0,
    };

    this.jobs.set(job.id, job);

    // Update campaign status to scheduled
    await this.updateCampaignStatus(campaign.id, 'scheduled');

    return job;
  }

  async dequeue(): Promise<CampaignJob | null> {
    const now = new Date();

    // Find the next job that's ready to run
    for (const job of Array.from(this.jobs.values())) {
      if (job.status === 'pending' && job.scheduledAt <= now) {
        job.status = 'running';
        job.startedAt = new Date();
        await this.updateCampaignStatus(job.campaignId, 'sending');
        return job;
      }
    }

    return null;
  }

  async getJob(jobId: string): Promise<CampaignJob | null> {
    return this.jobs.get(jobId) || null;
  }

  async getJobs(user_id: string, status?: CampaignJob['status']): Promise<CampaignJob[]> {
    const jobs = Array.from(this.jobs.values()).filter(job => job.user_id === user_id);
    return status ? jobs.filter(job => job.status === status) : jobs;
  }

  async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'running') {
      throw new Error('Job not found or not in running state');
    }

    try {
      // Get campaign and customers
      const campaign = await this.getCampaign(job.campaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }
      
      // Transform database response to camelCase for internal use
      const campaignUI = transformDatabaseResponse(campaign) as unknown as CampaignUI;
      
      const customers = await this.getCampaignCustomers(job.campaignId);
      if (customers.length === 0) {
        throw new Error('No customers found for campaign');
      }
      
      // Transform customers to camelCase for internal use
      const customersUI = transformDatabaseResponse(customers) as unknown as CustomerUI[];

      // Process messages in batches
      const batchSize = 50;
      const batches = this.createBatches(customers, batchSize);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        // Check if job is still running
        const currentJob = this.jobs.get(jobId);
        if (!currentJob || currentJob.status !== 'running') {
          throw new Error('Job was stopped during processing');
        }

        // Transform batch to camelCase for processing
        const batchUI = transformDatabaseResponse(batch) as unknown as CustomerUI[];
        await this.processBatch(job, campaignUI, batchUI);

        // Update progress
        job.progress = Math.round(((i + 1) / batches.length) * 100);
        job.sentCount = Math.min((i + 1) * batchSize, customers.length);

        // Add delay between batches to respect rate limits
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Mark job as completed
      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 100;

      await this.updateCampaignStatus(job.campaignId, 'completed');

    } catch (error: any) {
      console.error(`Failed to process job ${jobId}:`, error);

      job.status = 'failed';
      job.errorMessage = error.message;

      await this.updateCampaignStatus(job.campaignId, 'failed');

      // Schedule retry if available
      if (job.retryCount < job.maxRetries) {
        await this.scheduleRetry(job);
      }
    }
  }

  private async processBatch(
    job: CampaignJob,
    campaign: CampaignUI,
    customers: CustomerUI[]
  ): Promise<void> {
    const messages = customers.map(customer => ({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      campaignId: campaign.id,
      to: this.formatPhoneNumber(customer.phone),
      from: process.env.TWILIO_PHONE_NUMBER || '+15017122661',
      body: this.personalizeMessage(campaign.messageBody, customer),
      status: 'pending' as const,
    }));

    const results = await this.smsService.sendBatch(messages);

    // Update job statistics
    for (const result of results) {
      if (result.status === 'sent' || result.status === 'delivered') {
        job.deliveredCount++;
      } else {
        job.failedCount++;
      }

      // Store individual message results for tracking
      await this.storeCampaignCustomer({
        id: result.id,
        campaignId: campaign.id,
        customerId: customers.find(c => this.formatPhoneNumber(c.phone) === result.to)?.id || '',
        customerPhone: result.to,
        messageBody: result.body,
        status: result.status === 'sent' ? 'sent' : 'failed',
        sentAt: result.sentAt,
        deliveredAt: result.deliveredAt,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        retries: 0,
      });
    }
  }

  async pauseJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'running') {
      throw new Error('Job not found or not running');
    }

    job.status = 'paused';
    await this.updateCampaignStatus(job.campaignId, 'paused');
  }

  async resumeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'paused') {
      throw new Error('Job not found or not paused');
    }

    job.status = 'running';
    await this.updateCampaignStatus(job.campaignId, 'sending');

    // Resume processing
    this.processJob(jobId);
  }

  async cancelJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || (job.status !== 'running' && job.status !== 'pending' && job.status !== 'paused')) {
      throw new Error('Job not found or cannot be cancelled');
    }

    job.status = 'failed';
    job.errorMessage = 'Cancelled by user';
    job.completedAt = new Date();

    await this.updateCampaignStatus(job.campaignId, 'failed');
  }

  async retryFailedJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'failed') {
      throw new Error('Job not found or not failed');
    }

    if (job.retryCount >= job.maxRetries) {
      throw new Error('Maximum retries exceeded');
    }

    await this.scheduleRetry(job);
  }

  private async scheduleRetry(job: CampaignJob): Promise<void> {
    job.retryCount++;
    job.status = 'pending';

    // Schedule retry with exponential backoff
    const retryDelay = Math.min(300000, Math.pow(2, job.retryCount) * 60000); // Max 5 minutes
    job.scheduledAt = new Date(Date.now() + retryDelay);

    await this.updateCampaignStatus(job.campaignId, 'scheduled');
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private personalizeMessage(template: string, customer: CustomerUI): string {
    return template
      .replace(/\{\{firstName\}\}/g, customer.firstName || 'there')
      .replace(/\{\{lastName\}\}/g, customer.lastName || '')
      .replace(/\{\{phone\}\}/g, customer.phone || '')
      .replace(/\{\{email\}\}/g, customer.email || '');
  }

  private formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      return `+1${cleanPhone}`;
    }
    return phone;
  }

  private async updateCampaignStatus(campaignId: string, status: string): Promise<void> {
    // In a real implementation, this would update the database
    // For now, we'll just log it
    console.log(`Updating campaign ${campaignId} status to ${status}`);
  }

  private async getCampaign(campaignId: string): Promise<Campaign | null> {
    // Mock implementation - would fetch from database
    return null;
  }

  private async getCampaignCustomers(campaignId: string): Promise<Customer[]> {
    // Import the actual database function
    const { getCampaignCustomers } = await import('@/lib/db');
    return await getCampaignCustomers(campaignId);
  }

  private async storeCampaignCustomer(customer: CampaignCustomer): Promise<void> {
    try {
      // Import the database functions
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      
      // Store campaign message/customer relationship
      const { error } = await supabase
        .from('campaign_messages')
        .upsert({
          campaign_id: customer.campaignId,
          customer_id: customer.customerId,
          phone_number: customer.customerPhone,
          message_body: customer.messageBody,
          status: customer.status || 'pending',
          twilio_sid: undefined // Will be set when message is actually sent
        });

      if (error) {
        console.error('Error storing campaign customer:', error);
        // If junction table doesn't exist, just log for now
        console.log(`Would store campaign customer: ${customer.id}`);
      }
    } catch (error) {
      console.error('Error in storeCampaignCustomer:', error);
      console.log(`Fallback: storing campaign customer: ${customer.id}`);
    }
  }
}

// Campaign queue worker
export class CampaignQueueWorker {
  private queue: CampaignQueue;
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(queue: CampaignQueue) {
    this.queue = queue;
  }

  start(pollingInterval: number = 30000): void { // 30 seconds default
    if (this.isRunning) {
      console.log('Campaign queue worker is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting campaign queue worker');

    this.interval = setInterval(async () => {
      try {
        const job = await this.queue.dequeue();
        if (job) {
          console.log(`Processing campaign job: ${job.id}`);

          // Process job in background
          this.queue.processJob(job.id).catch(error => {
            console.error(`Failed to process job ${job.id}:`, error);
          });
        }
      } catch (error) {
        console.error('Campaign queue worker error:', error);
      }
    }, pollingInterval);
  }

  stop(): void {
    if (!this.isRunning) {
      console.log('Campaign queue worker is not running');
      return;
    }

    this.isRunning = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    console.log('Campaign queue worker stopped');
  }

  getStatus(): { isRunning: boolean; interval: number | null } {
    return {
      isRunning: this.isRunning,
      interval: this.interval ? 30000 : null, // Default polling interval
    };
  }
}

// Global instances
export const campaignQueue = new InMemoryCampaignQueue();
export const campaignQueueWorker = new CampaignQueueWorker(campaignQueue);

// Auto-start the worker in production
if (process.env.NODE_ENV === 'production') {
  campaignQueueWorker.start();
}