/**
 * Generate CSV template content for customer import
 * Returns a string containing properly formatted CSV with headers and sample data
 */
export function generateCustomerImportTemplate(): string {
  const headers = ['Phone', 'FirstName', 'LastName', 'Email', 'Company'];
  
  // Sample data with realistic examples that will pass validation
  const sampleData = [
    ['5551234567', 'John', 'Doe', 'john.doe@example.com', 'Acme Corporation'],
    ['(212) 555-0123', 'Jane', 'Smith', 'jane.smith@techcorp.com', 'Tech Solutions Inc'],
    ['555-987-6543', 'Michael', 'Johnson', 'michael.j@startup.io', 'Startup Ventures'],
    ['(415) 555-7890', 'Sarah', 'Williams', 'sarah.williams@design.co', 'Creative Agency'],
    ['5552345678', 'Robert', 'Brown', 'robert.b@consulting.com', 'Business Consultants']
  ];

  // Convert to CSV format
  const csvRows = [
    headers.join(','),
    ...sampleData.map(row => 
      row.map(field => {
        // Escape commas and quotes in fields by wrapping in quotes
        if (field.includes(',') || field.includes('"')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

/**
 * Generate CSV content as a Blob for download
 */
export function generateTemplateBlob(): Blob {
  const csvContent = generateCustomerImportTemplate();
  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Get the suggested filename for the template
 */
export function getTemplateFilename(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  return `customer-import-template-${dateStr}.csv`;
}