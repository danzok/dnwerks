# Next.js API Route Templates

## Standard API Route Structure

### Basic CRUD API Route
```typescript
// pages/api/campaigns/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.campaign.count({ where })
    ]);

    return res.status(200).json({
      campaigns,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { name, description, messageContent, scheduledAt } = req.body;

    // Validation
    if (!name?.trim()) {
      return res.status(400).json({ error: 'Campaign name is required' });
    }
    if (!messageContent?.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }
    if (messageContent.length > 1600) {
      return res.status(400).json({ error: 'Message content too long (max 1600 chars)' });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        messageContent: messageContent.trim(),
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        createdBy: session.user.id,
        status: 'draft'
      },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    return res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ error: 'Failed to create campaign' });
  }
}
```

### Single Resource API Route
```typescript
// pages/api/campaigns/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  const { id } = req.query;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Valid campaign ID is required' });
  }

  switch (req.method) {
    case 'GET':
      return handleGet(req, res, id);
    case 'PUT':
      return handlePut(req, res, id);
    case 'DELETE':
      return handleDelete(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        messages: {
          select: {
            id: true,
            phoneNumber: true,
            status: true,
            createdAt: true,
            sentAt: true,
            deliveredAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        _count: {
          select: {
            messages: true,
            messagesSent: { where: { status: 'sent' } },
            messagesDelivered: { where: { status: 'delivered' } }
          }
        }
      }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    return res.status(200).json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return res.status(500).json({ error: 'Failed to fetch campaign' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const { name, description, messageContent, scheduledAt, status } = req.body;

    // Check if campaign exists and user has permission
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true, status: true, createdBy: true }
    });

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (existingCampaign.createdBy !== session.user.id && session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Prevent editing sent campaigns
    if (existingCampaign.status === 'sent') {
      return res.status(400).json({ error: 'Cannot edit sent campaigns' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (messageContent !== undefined) updateData.messageContent = messageContent.trim();
    if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (status !== undefined) updateData.status = status;

    updateData.updatedAt = new Date();

    const campaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { messages: true }
        }
      }
    });

    return res.status(200).json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    return res.status(500).json({ error: 'Failed to update campaign' });
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true, status: true, createdBy: true }
    });

    if (!existingCampaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (existingCampaign.createdBy !== session.user.id && session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Prevent deleting sent campaigns
    if (existingCampaign.status === 'sent') {
      return res.status(400).json({ error: 'Cannot delete sent campaigns' });
    }

    await prisma.campaign.delete({
      where: { id }
    });

    return res.status(204).end();
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return res.status(500).json({ error: 'Failed to delete campaign' });
  }
}
```

## Specialized API Routes

### Bulk Operations API
```typescript
// pages/api/campaigns/[id]/send-bulk.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../../../lib/prisma';
import { sendSMS } from '../../../../../lib/sms-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const session = await getSession({ req });
  const { id } = req.query;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { customerIds, messageContent, scheduleAt } = req.body;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Valid campaign ID is required' });
    }

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ error: 'Customer IDs array is required' });
    }

    if (customerIds.length > 10000) {
      return res.status(400).json({ error: 'Maximum 10,000 messages per batch' });
    }

    // Verify campaign ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { id: true, createdBy: true, status: true }
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.createdBy !== session.user.id && session.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Get customers
    const customers = await prisma.customer.findMany({
      where: {
        id: { in: customerIds },
        smsConsent: true,
        doNotContact: false
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true
      }
    });

    if (customers.length === 0) {
      return res.status(400).json({ error: 'No valid customers found' });
    }

    // Create message records
    const messages = customers.map(customer => ({
      campaignId: id,
      customerId: customer.id,
      phoneNumber: customer.phone,
      messageContent: messageContent || `Hi ${customer.firstName}!`,
      status: scheduleAt ? 'scheduled' : 'pending',
      scheduledAt: scheduleAt ? new Date(scheduleAt) : null
    }));

    const createdMessages = await prisma.campaignMessage.createMany({
      data: messages
    });

    // If not scheduled, queue for immediate sending
    if (!scheduleAt) {
      // Send in batches of 100
      const batchSize = 100;
      for (let i = 0; i < customers.length; i += batchSize) {
        const batch = customers.slice(i, i + batchSize);

        await Promise.allSettled(
          batch.map(async (customer) => {
            try {
              await sendSMS({
                to: customer.phone,
                message: messageContent || `Hi ${customer.firstName}!`,
                campaignId: id,
                customerId: customer.id
              });
            } catch (error) {
              console.error(`Failed to send SMS to ${customer.phone}:`, error);
            }
          })
        );
      }
    }

    return res.status(201).json({
      success: true,
      messagesCreated: createdMessages.count,
      customersProcessed: customers.length,
      scheduled: !!scheduleAt
    });
  } catch (error) {
    console.error('Error in bulk send:', error);
    return res.status(500).json({ error: 'Failed to process bulk send' });
  }
}
```

### File Upload API
```typescript
// pages/api/customers/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../lib/prisma';
import formidable from 'formidable';
import fs from 'fs';
import csv from 'csv-parser';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const form = formidable({
      uploadDir: '/tmp',
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024 // 10MB
    });

    const [fields, files] = await form.parse(req);
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!file.originalFilename?.match(/\.(csv|txt)$/)) {
      return res.status(400).json({ error: 'Only CSV and TXT files are allowed' });
    }

    const customers: any[] = [];
    const errors: string[] = [];

    // Parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(file.filepath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            // Basic validation
            if (!row.phone || !row.phone.trim()) {
              errors.push(`Missing phone number: ${JSON.stringify(row)}`);
              return;
            }

            // Normalize phone number
            const phone = row.phone.replace(/[^\d+]/g, '');
            if (!phone.match(/^\+?[1-9]\d{1,14}$/)) {
              errors.push(`Invalid phone format: ${phone}`);
              return;
            }

            customers.push({
              firstName: row.firstName?.trim() || '',
              lastName: row.lastName?.trim() || '',
              phone: phone,
              email: row.email?.trim() || null,
              timezone: row.timezone?.trim() || 'UTC',
              smsConsent: row.smsConsent?.toLowerCase() === 'true',
              source: 'upload'
            });
          } catch (error) {
            errors.push(`Error processing row: ${JSON.stringify(row)}`);
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    if (customers.length === 0) {
      return res.status(400).json({
        error: 'No valid customers found in file',
        errors
      });
    }

    // Batch upsert customers
    const batchSize = 1000;
    let totalCreated = 0;
    let totalUpdated = 0;

    for (let i = 0; i < customers.length; i += batchSize) {
      const batch = customers.slice(i, i + batchSize);

      const result = await Promise.allSettled(
        batch.map(async (customer) => {
          try {
            await prisma.customer.upsert({
              where: { phone: customer.phone },
              update: {
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                timezone: customer.timezone,
                updatedAt: new Date()
              },
              create: {
                ...customer,
                createdBy: session.user.id
              }
            });

            return { status: 'success', phone: customer.phone };
          } catch (error) {
            if (error.code === 'P2002') { // Unique constraint violation
              return { status: 'duplicate', phone: customer.phone };
            }
            throw error;
          }
        })
      );

      result.forEach(({ status, value }) => {
        if (status === 'fulfilled') {
          if (value.status === 'success') {
            totalCreated++;
          } else if (value.status === 'duplicate') {
            totalUpdated++;
          }
        }
      });
    }

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      totalProcessed: customers.length,
      totalCreated,
      totalUpdated,
      errors: errors.slice(0, 10) // Return first 10 errors
    });
  } catch (error) {
    console.error('Error uploading customers:', error);
    return res.status(500).json({ error: 'Failed to process upload' });
  }
}
```

### Search API
```typescript
// pages/api/search/customers.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { prisma } from '../../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { q, tags, page = 1, limit = 20 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const where: any = {
      OR: [
        { firstName: { contains: q, mode: 'insensitive' } },
        { lastName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } }
      ]
    };

    // Add tag filtering
    if (tags && typeof tags === 'string') {
      const tagList = tags.split(',').map(tag => tag.trim());
      where.customerTags = {
        some: {
          tag: {
            name: { in: tagList }
          }
        }
      };
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          customerTags: {
            include: {
              tag: true
            }
          },
          _count: {
            select: { messages: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      }),
      prisma.customer.count({ where })
    ]);

    // Format response
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      email: customer.email,
      timezone: customer.timezone,
      smsConsent: customer.smsConsent,
      tags: customer.customerTags.map(ct => ct.tag),
      messageCount: customer._count.messages,
      createdAt: customer.createdAt
    }));

    return res.status(200).json({
      customers: formattedCustomers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error searching customers:', error);
    return res.status(500).json({ error: 'Failed to search customers' });
  }
}
```

## Middleware and Error Handling

### API Middleware
```typescript
// lib/api-middleware.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

interface AuthenticatedRequest extends NextApiRequest {
  user: any;
}

export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>,
  options: { requiredRole?: string[] } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getSession({ req });

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (options.requiredRole && !options.requiredRole.includes(session.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    (req as AuthenticatedRequest).user = session.user;
    return handler(req as AuthenticatedRequest, res);
  };
}

export function withValidation(
  schema: any,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      if (req.body) {
        const validatedData = await schema.parseAsync(req.body);
        req.body = validatedData;
      }
      return handler(req, res);
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      return res.status(400).json({ error: 'Invalid request data' });
    }
  };
}

export function withRateLimit(
  limit: number,
  windowMs: number,
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  const requests = new Map();

  return async (req: NextApiRequest, res: NextApiResponse) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    const existingRequests = requests.get(key) || [];
    const validRequests = existingRequests.filter((time: number) => time > windowStart);

    if (validRequests.length >= limit) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    validRequests.push(now);
    requests.set(key, validRequests);

    return handler(req, res);
  };
}
```

### Error Handler
```typescript
// lib/api-error-handler.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: any, res: NextApiResponse) {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code
    });
  }

  if (error.code === 'P2002') {
    return res.status(409).json({
      error: 'Resource already exists',
      code: 'DUPLICATE_ERROR'
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      error: 'Resource not found',
      code: 'NOT_FOUND'
    });
  }

  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
}
```