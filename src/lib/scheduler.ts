import { Campaign, Customer } from '@/lib/types';
import { campaignQueue } from '@/lib/campaign-queue';

export interface ScheduledTask {
  id: string;
  type: 'campaign' | 'reminder' | 'cleanup';
  campaignId?: string;
  userId: string;
  scheduledAt: Date;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskScheduler {
  scheduleCampaign(campaign: Campaign, customers: Customer[]): Promise<ScheduledTask>;
  scheduleReminder(userId: string, message: string, remindAt: Date): Promise<ScheduledTask>;
  scheduleCleanup(taskType: string, runAt: Date): Promise<ScheduledTask>;
  cancelTask(taskId: string): Promise<void>;
  getPendingTasks(): Promise<ScheduledTask[]>;
  getTasksForUser(userId: string): Promise<ScheduledTask[]>;
  processTask(task: ScheduledTask): Promise<void>;
}

export class InMemoryTaskScheduler implements TaskScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private processingInterval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.startProcessing();
  }

  async scheduleCampaign(campaign: Campaign, customers: Customer[]): Promise<ScheduledTask> {
    const task: ScheduledTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'campaign',
      campaignId: campaign.id,
      userId: campaign.userId,
      scheduledAt: campaign.scheduledAt || new Date(),
      status: 'pending',
      data: {
        campaign,
        customers,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(task.id, task);

    // Also enqueue in campaign queue
    await campaignQueue.enqueue(campaign, customers);

    return task;
  }

  async scheduleReminder(userId: string, message: string, remindAt: Date): Promise<ScheduledTask> {
    const task: ScheduledTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'reminder',
      userId,
      scheduledAt: remindAt,
      status: 'pending',
      data: {
        message,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  async scheduleCleanup(taskType: string, runAt: Date): Promise<ScheduledTask> {
    const task: ScheduledTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'cleanup',
      userId: 'system',
      scheduledAt: runAt,
      status: 'pending',
      data: {
        taskType,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set(task.id, task);
    return task;
  }

  async cancelTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.status !== 'pending') {
      throw new Error('Cannot cancel task that is not pending');
    }

    task.status = 'cancelled';
    task.updatedAt = new Date();

    // If it's a campaign task, also cancel the campaign job
    if (task.type === 'campaign' && task.campaignId) {
      try {
        const jobs = await campaignQueue.getJobs(task.userId);
        const campaignJob = jobs.find(job => job.campaignId === task.campaignId);
        if (campaignJob) {
          await campaignQueue.cancelJob(campaignJob.id);
        }
      } catch (error) {
        console.error('Failed to cancel campaign job:', error);
      }
    }
  }

  async getPendingTasks(): Promise<ScheduledTask[]> {
    return Array.from(this.tasks.values()).filter(task => task.status === 'pending');
  }

  async getTasksForUser(userId: string): Promise<ScheduledTask[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }

  async processTask(task: ScheduledTask): Promise<void> {
    if (task.status !== 'pending') {
      return;
    }

    try {
      task.status = 'completed';
      task.updatedAt = new Date();

      switch (task.type) {
        case 'reminder':
          await this.processReminder(task);
          break;
        case 'cleanup':
          await this.processCleanup(task);
          break;
        case 'campaign':
          // Campaign tasks are handled by the campaign queue
          // This is just a placeholder to mark the task as completed
          console.log(`Campaign task ${task.id} processed by campaign queue`);
          break;
      }
    } catch (error: any) {
      console.error(`Failed to process task ${task.id}:`, error);
      task.status = 'failed';
      task.updatedAt = new Date();

      // Store error message in task data
      task.data.error = error.message;
    }
  }

  private async processReminder(task: ScheduledTask): Promise<void> {
    // In a real implementation, this would send a notification
    console.log(`Reminder for user ${task.userId}: ${task.data.message}`);
  }

  private async processCleanup(task: ScheduledTask): Promise<void> {
    const { taskType } = task.data;

    switch (taskType) {
      case 'old_logs':
        await this.cleanupOldLogs();
        break;
      case 'failed_messages':
        await this.cleanupFailedMessages();
        break;
      case 'metrics':
        await this.calculateDailyMetrics();
        break;
      default:
        console.log(`Unknown cleanup task type: ${taskType}`);
    }
  }

  private async cleanupOldLogs(): Promise<void> {
    // Mock implementation - would clean up old log entries
    console.log('Cleaning up old logs...');
  }

  private async cleanupFailedMessages(): Promise<void> {
    // Mock implementation - would clean up old failed message entries
    console.log('Cleaning up failed messages...');
  }

  private async calculateDailyMetrics(): Promise<void> {
    // Mock implementation - would calculate and store daily metrics
    console.log('Calculating daily metrics...');
  }

  private startProcessing(): void {
    if (this.processingInterval) {
      return;
    }

    console.log('Starting task scheduler');

    // Check for tasks to process every minute
    this.processingInterval = setInterval(async () => {
      if (this.isProcessing) {
        return;
      }

      this.isProcessing = true;

      try {
        const now = new Date();
        const pendingTasks = await this.getPendingTasks();

        for (const task of pendingTasks) {
          if (task.scheduledAt <= now) {
            await this.processTask(task);
          }
        }
      } catch (error) {
        console.error('Task scheduler error:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 60000); // Check every minute
  }

  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    console.log('Task scheduler stopped');
  }

  // Utility methods
  async getTaskStats(userId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    failed: number;
    cancelled: number;
  }> {
    const tasks = await this.getTasksForUser(userId);

    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };
  }

  async getUpcomingTasks(userId: string, limit: number = 10): Promise<ScheduledTask[]> {
    const tasks = await this.getTasksForUser(userId);
    const now = new Date();

    return tasks
      .filter(task => task.status === 'pending' && task.scheduledAt > now)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
      .slice(0, limit);
  }
}

// Global task scheduler instance
export const taskScheduler = new InMemoryTaskScheduler();

// Utility functions
export async function scheduleCampaign(campaign: Campaign, customers: Customer[]): Promise<void> {
  try {
    // Validate campaign data
    if (!campaign.id || !campaign.userId || !campaign.messageBody) {
      throw new Error('Invalid campaign data');
    }

    if (!customers || customers.length === 0) {
      throw new Error('No customers specified for campaign');
    }

    // Schedule the campaign
    await taskScheduler.scheduleCampaign(campaign, customers);

    console.log(`Campaign ${campaign.id} scheduled for ${customers.length} recipients`);

  } catch (error) {
    console.error('Failed to schedule campaign:', error);
    throw error;
  }
}

export async function rescheduleCampaign(
  campaign: Campaign,
  customers: Customer[],
  newScheduledAt: Date
): Promise<void> {
  try {
    // Cancel existing scheduled task if any
    const existingTasks = await taskScheduler.getTasksForUser(campaign.userId);
    const campaignTask = existingTasks.find(
      task => task.type === 'campaign' && task.campaignId === campaign.id
    );

    if (campaignTask) {
      await taskScheduler.cancelTask(campaignTask.id);
    }

    // Update campaign schedule time
    campaign.scheduledAt = newScheduledAt;

    // Schedule new task
    await scheduleCampaign(campaign, customers);

    console.log(`Campaign ${campaign.id} rescheduled to ${newScheduledAt.toISOString()}`);

  } catch (error) {
    console.error('Failed to reschedule campaign:', error);
    throw error;
  }
}

export async function cancelScheduledCampaign(campaignId: string, userId: string): Promise<void> {
  try {
    // Find and cancel the scheduled task
    const tasks = await taskScheduler.getTasksForUser(userId);
    const campaignTask = tasks.find(
      task => task.type === 'campaign' && task.campaignId === campaignId
    );

    if (campaignTask) {
      await taskScheduler.cancelTask(campaignTask.id);
    }

    // Also cancel the campaign job if it exists
    const jobs = await campaignQueue.getJobs(userId);
    const campaignJob = jobs.find(job => job.campaignId === campaignId);
    if (campaignJob && (campaignJob.status === 'pending' || campaignJob.status === 'running')) {
      await campaignQueue.cancelJob(campaignJob.id);
    }

    console.log(`Campaign ${campaignId} cancelled`);

  } catch (error) {
    console.error('Failed to cancel campaign:', error);
    throw error;
  }
}