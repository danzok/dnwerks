import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { generateCustomerImportTemplate, getTemplateFilename } from '@/lib/utils/csv-template'

// GET /api/customers/template - Download CSV template for customer import
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth(request)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate CSV template content
    const csvContent = generateCustomerImportTemplate()
    const filename = getTemplateFilename()

    // Create response with CSV content
    const response = new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

    return response
    
  } catch (error) {
    console.error('Error generating customer template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' }, 
      { status: 500 }
    )
  }
}