# Testing Plan for Tag Filtering and Pagination

## Overview
This document outlines the comprehensive testing strategy for implementing tag filtering and pagination (limit to 10 contacts) in the contacts page.

## Testing Environment Setup

### Prerequisites
1. Database with migrated schema (tags field added)
2. Test data with various tag combinations
3. Different user roles for permission testing
4. Browser compatibility testing environment

### Test Data Requirements
```sql
-- Sample test data with tags
INSERT INTO customers (user_id, phone, first_name, last_name, email, state, tags) VALUES
('user-id-1', '+1234567890', 'John', 'Doe', 'john@example.com', 'CA', ARRAY['vip', 'newsletter']),
('user-id-1', '+1234567891', 'Jane', 'Smith', 'jane@example.com', 'NY', ARRAY['customer', 'premium']),
('user-id-1', '+1234567892', 'Bob', 'Johnson', 'bob@example.com', 'TX', ARRAY['newsletter', 'trial']),
('user-id-1', '+1234567893', 'Alice', 'Brown', 'alice@example.com', 'FL', ARRAY['vip', 'premium', 'newsletter']),
('user-id-1', '+1234567894', 'Charlie', 'Wilson', 'charlie@example.com', 'WA', ARRAY['customer']),
-- Add 15 more contacts to test pagination
('user-id-1', '+1234567895', 'Diana', 'Miller', 'diana@example.com', 'OR', ARRAY['trial']),
('user-id-1', '+1234567896', 'Edward', 'Davis', 'edward@example.com', 'NV', ARRAY['newsletter']),
('user-id-1', '+1234567897', 'Fiona', 'Garcia', 'fiona@example.com', 'AZ', ARRAY['vip']),
('user-id-1', '+1234567898', 'George', 'Martinez', 'george@example.com', 'CO', ARRAY['customer', 'trial']),
('user-id-1', '+1234567899', 'Helen', 'Anderson', 'helen@example.com', 'UT', ARRAY['premium']),
('user-id-1', '+1234567900', 'Ian', 'Taylor', 'ian@example.com', 'ID', ARRAY['newsletter']),
('user-id-1', '+1234567901', 'Julia', 'Thomas', 'julia@example.com', 'MT', ARRAY['vip', 'customer']),
('user-id-1', '+1234567902', 'Kevin', 'Jackson', 'kevin@example.com', 'WY', ARRAY['trial']),
('user-id-1', '+1234567903', 'Laura', 'White', 'laura@example.com', 'NM', ARRAY['premium', 'newsletter']),
('user-id-1', '+1234567904', 'Michael', 'Harris', 'michael@example.com', 'AK', ARRAY['customer']),
('user-id-1', '+1234567905', 'Nancy', 'Clark', 'nancy@example.com', 'HI', ARRAY['vip', 'trial']),
('user-id-1', '+1234567906', 'Oliver', 'Lewis', 'oliver@example.com', 'ME', ARRAY['newsletter']),
('user-id-1', '+1234567907', 'Patricia', 'Walker', 'patricia@example.com', 'NH', ARRAY['premium']),
('user-id-1', '+1234567908', 'Quentin', 'Hall', 'quentin@example.com', 'VT', ARRAY['customer', 'newsletter']),
('user-id-1', '+1234567909', 'Rachel', 'Young', 'rachel@example.com', 'MA', ARRAY['vip', 'premium']);
```

## Unit Tests

### 1. Database Migration Tests
```sql
-- Test 1: Verify tags column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'customers' AND column_name = 'tags';

-- Test 2: Verify GIN index exists
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'customers' AND indexname = 'idx_customers_tags';

-- Test 3: Test tag array operations
INSERT INTO customers (user_id, phone, tags) 
VALUES ('test-user', '+1111111111', ARRAY['tag1', 'tag2', 'tag3']);

SELECT * FROM customers 
WHERE tags @> ARRAY['tag1']; -- Should return the inserted record

UPDATE customers 
SET tags = array_append(tags, 'tag4') 
WHERE phone = '+1111111111';

SELECT tags FROM customers WHERE phone = '+1111111111'; -- Should include 'tag4'
```

### 2. API Endpoint Tests

#### GET /api/customers Tests
```javascript
// Test 1: Basic pagination
fetch('/api/customers?page=1&limit=10')
  .then(response => response.json())
  .then(data => {
    console.assert(data.data.length <= 10, 'Should return max 10 contacts');
    console.assert(data.pagination.page === 1, 'Page should be 1');
    console.assert(data.pagination.limit === 10, 'Limit should be 10');
  });

// Test 2: Tag filtering
fetch('/api/customers?tags=vip,newsletter')
  .then(response => response.json())
  .then(data => {
    data.data.forEach(contact => {
      console.assert(
        contact.tags.includes('vip') && contact.tags.includes('newsletter'),
        'All contacts should have both vip and newsletter tags'
      );
    });
  });

// Test 3: Combined filters
fetch('/api/customers?search=john&state=CA&tags=vip&page=1&limit=5')
  .then(response => response.json())
  .then(data => {
    data.data.forEach(contact => {
      console.assert(
        contact.first_name.toLowerCase().includes('john') ||
        contact.last_name.toLowerCase().includes('john') ||
        contact.email.toLowerCase().includes('john') ||
        contact.phone.includes('john'),
        'Should match search query'
      );
      console.assert(contact.state === 'CA', 'Should be in CA');
      console.assert(contact.tags.includes('vip'), 'Should have vip tag');
    });
  });

// Test 4: Available tags
fetch('/api/customers')
  .then(response => response.json())
  .then(data => {
    console.assert(Array.isArray(data.tags), 'Tags should be an array');
    console.assert(data.tags.length > 0, 'Should have available tags');
    console.assert(data.tags.every(tag => typeof tag === 'string'), 'All tags should be strings');
  });
```

#### POST /api/customers Tests
```javascript
// Test 1: Create contact with tags
fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+1999999999',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    tags: ['new', 'test']
  })
})
  .then(response => response.json())
  .then(data => {
    console.assert(data.tags.includes('new'), 'Should have new tag');
    console.assert(data.tags.includes('test'), 'Should have test tag');
  });

// Test 2: Create contact without tags
fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+1999999998',
    firstName: 'Test',
    lastName: 'User2'
  })
})
  .then(response => response.json())
  .then(data => {
    console.assert(Array.isArray(data.tags), 'Tags should be an array');
    console.assert(data.tags.length === 0, 'Should have empty tags array');
  });
```

### 3. Frontend Component Tests

#### TagInput Component Tests
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from '@/components/ui/tag-input';

test('should add tag on Enter key', () => {
  const onChange = jest.fn();
  render(<TagInput value={[]} onChange={onChange} />);
  
  const input = screen.getByPlaceholderText('Add tag...');
  fireEvent.change(input, { target: { value: 'test-tag' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  
  expect(onChange).toHaveBeenCalledWith(['test-tag']);
});

test('should remove tag on X click', () => {
  const onChange = jest.fn();
  render(<TagInput value={['tag1', 'tag2']} onChange={onChange} />);
  
  const removeButtons = screen.getAllByRole('button');
  fireEvent.click(removeButtons[0]); // Remove first tag
  
  expect(onChange).toHaveBeenCalledWith(['tag2']);
});

test('should not add duplicate tags', () => {
  const onChange = jest.fn();
  render(<TagInput value={['existing']} onChange={onChange} />);
  
  const input = screen.getByPlaceholderText('Add tag...');
  fireEvent.change(input, { target: { value: 'existing' } });
  fireEvent.keyDown(input, { key: 'Enter' });
  
  expect(onChange).not.toHaveBeenCalled();
});
```

#### MultiSelect Component Tests
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelect } from '@/components/ui/multi-select';

const options = [
  { value: 'vip', label: 'VIP' },
  { value: 'newsletter', label: 'Newsletter' },
  { value: 'premium', label: 'Premium' }
];

test('should select multiple options', () => {
  const onChange = jest.fn();
  render(<MultiSelect options={options} selected={[]} onChange={onChange} />);
  
  fireEvent.click(screen.getByText('VIP'));
  fireEvent.click(screen.getByText('Newsletter'));
  
  expect(onChange).toHaveBeenLastCalledWith(['vip', 'newsletter']);
});

test('should clear all selections', () => {
  const onChange = jest.fn();
  render(<MultiSelect options={options} selected={['vip', 'newsletter']} onChange={onChange} />);
  
  fireEvent.click(screen.getByText('Clear All'));
  
  expect(onChange).toHaveBeenCalledWith([]);
});
```

## Integration Tests

### 1. End-to-End Contact Filtering Flow
```javascript
// Test complete filtering workflow
describe('Contact Filtering and Pagination', () => {
  test('should filter contacts by tags and paginate', async () => {
    // Visit contacts page
    await page.goto('/contacts');
    
    // Wait for contacts to load
    await page.waitForSelector('[data-testid="contact-table"]');
    
    // Verify initial state (should show 10 contacts)
    const contactRows = await page.$$('[data-testid="contact-row"]');
    expect(contactRows.length).toBeLessThanOrEqual(10);
    
    // Open tag filter dropdown
    await page.click('[data-testid="tag-filter"]');
    
    // Select 'vip' and 'newsletter' tags
    await page.click('[data-testid="tag-option-vip"]');
    await page.click('[data-testid="tag-option-newsletter"]');
    
    // Apply filter
    await page.click('[data-testid="apply-filter"]');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Verify filtered results
    const filteredRows = await page.$$('[data-testid="contact-row"]');
    for (const row of filteredRows) {
      const tagsText = await row.$eval('[data-testid="contact-tags"]', el => el.textContent);
      expect(tagsText).toContain('vip');
      expect(tagsText).toContain('newsletter');
    }
    
    // Test pagination
    if (await page.$('[data-testid="next-page"]')) {
      await page.click('[data-testid="next-page"]');
      await page.waitForTimeout(1000);
      
      // Verify page changed
      const pageInfo = await page.$eval('[data-testid="page-info"]', el => el.textContent);
      expect(pageInfo).toContain('Page 2');
    }
  });
});
```

### 2. Contact Creation with Tags Test
```javascript
test('should create contact with multiple tags', async () => {
  await page.goto('/contacts');
  
  // Click Add Contact button
  await page.click('[data-testid="add-contact"]');
  
  // Fill form fields
  await page.fill('[data-testid="first-name"]', 'Test');
  await page.fill('[data-testid="last-name"]', 'Contact');
  await page.fill('[data-testid="phone"]', '+1555555555');
  await page.fill('[data-testid="email"]', 'test@example.com');
  
  // Add tags
  const tagInput = await page.$('[data-testid="tag-input"]');
  await tagInput.fill('vip');
  await tagInput.press('Enter');
  await tagInput.fill('newsletter');
  await tagInput.press('Enter');
  
  // Submit form
  await page.click('[data-testid="save-contact"]');
  
  // Verify success message
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  
  // Verify contact appears in list with tags
  await page.waitForTimeout(1000);
  const newContact = await page.locator('[data-testid="contact-row"]').first();
  await expect(newContact).toContainText('Test Contact');
  await expect(newContact.locator('[data-testid="contact-tags"]')).toContainText('vip');
  await expect(newContact.locator('[data-testid="contact-tags"]')).toContainText('newsletter');
});
```

## Performance Tests

### 1. Database Query Performance
```sql
-- Test tag filtering performance
EXPLAIN ANALYZE SELECT * FROM customers 
WHERE user_id = 'test-user' AND tags @> ARRAY['vip'];

-- Test pagination performance
EXPLAIN ANALYZE SELECT * FROM customers 
WHERE user_id = 'test-user' 
ORDER BY created_at DESC 
LIMIT 10 OFFSET 20;

-- Test combined filters performance
EXPLAIN ANALYZE SELECT * FROM customers 
WHERE user_id = 'test-user' 
AND tags @> ARRAY['vip', 'newsletter']
AND state = 'CA'
ORDER BY created_at DESC 
LIMIT 10 OFFSET 0;
```

### 2. Frontend Performance Tests
```javascript
// Test rendering performance with large datasets
describe('Performance Tests', () => {
  test('should render 1000 contacts efficiently', async () => {
    const startTime = performance.now();
    
    // Mock large dataset
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      id: `contact-${i}`,
      firstName: `Contact ${i}`,
      lastName: `Test`,
      email: `contact${i}@example.com`,
      phone: `+1555555${i.toString().padStart(4, '0')}`,
      tags: [`tag${i % 10}`, `category${i % 5}`]
    }));
    
    render(<VercelDataTable data={largeDataset} columns={columns} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });
  
  test('should debounce search queries', async () => {
    const onSearch = jest.fn();
    render(<SearchInput onSearch={onSearch} debounceMs={300} />);
    
    const input = screen.getByPlaceholderText('Search...');
    
    // Type quickly
    fireEvent.change(input, { target: { value: 'a' } });
    fireEvent.change(input, { target: { value: 'ab' } });
    fireEvent.change(input, { target: { value: 'abc' } });
    
    // Should not have called search yet
    expect(onSearch).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('abc');
    }, { timeout: 400 });
  });
});
```

## Browser Compatibility Tests

### Supported Browsers
1. Chrome (latest 2 versions)
2. Firefox (latest 2 versions)
3. Safari (latest 2 versions)
4. Edge (latest 2 versions)

### Test Cases
- Tag input functionality
- Multi-select dropdown
- Pagination controls
- Responsive design on mobile devices
- Dark mode compatibility

## Accessibility Tests

### WCAG 2.1 AA Compliance
```javascript
// Test keyboard navigation
test('should be keyboard navigable', () => {
  render(<ContactsPage />);
  
  // Tab through all interactive elements
  fireEvent.keyDown(document, { key: 'Tab' });
  
  // Verify focus management
  expect(document.activeElement).toBeVisible();
  
  // Test tag filter keyboard navigation
  fireEvent.click(screen.getByTestId('tag-filter'));
  fireEvent.keyDown(screen.getByTestId('tag-option-vip'), { key: 'Enter' });
  
  // Verify tag is selected
  expect(screen.getByTestId('selected-tag-vip')).toBeVisible();
});

// Test screen reader compatibility
test('should have proper ARIA labels', () => {
  render(<ContactsPage />);
  
  // Check for proper ARIA labels
  expect(screen.getByLabelText('Filter by tags')).toBeInTheDocument();
  expect(screen.getByLabelText('Page navigation')).toBeInTheDocument();
  expect(screen.getByRole('table')).toHaveAttribute('aria-label', 'Contacts table');
});
```

## Security Tests

### Input Validation Tests
```javascript
test('should sanitize tag inputs', async () => {
  const maliciousTags = ['<script>alert("xss")</script>', 'javascript:alert(1)', '"><img src=x onerror=alert(1)>'];
  
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '+1999999999',
      firstName: 'Test',
      lastName: 'Security',
      tags: maliciousTags
    })
  });
  
  const data = await response.json();
  
  // Tags should be sanitized
  data.tags.forEach(tag => {
    expect(tag).not.toContain('<script>');
    expect(tag).not.toContain('javascript:');
    expect(tag).not.toContain('onerror');
  });
});
```

## Regression Tests

### Existing Functionality Verification
1. Search functionality still works
2. State filtering still works
3. Contact creation/editing/deletion works
4. Real-time updates still function
5. Dark mode compatibility maintained

## Test Automation

### CI/CD Pipeline Integration
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npm run migrate:test
        
      - name: Run unit tests
        run: npm run test:unit
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Run performance tests
        run: npm run test:performance
```

## Test Reporting

### Coverage Requirements
- Unit tests: 90%+ code coverage
- Integration tests: 80%+ feature coverage
- E2E tests: All critical user paths covered

### Test Metrics
1. Test execution time
2. Pass/fail rates
3. Performance benchmarks
4. Accessibility compliance scores
5. Security vulnerability scans

## Rollback Plan

### If Tests Fail
1. Identify failing component
2. Revert to last stable version
3. Fix issues in separate branch
4. Re-run full test suite
5. Deploy fix after all tests pass

### Database Rollback
```sql
-- Rollback migration if needed
ALTER TABLE customers DROP COLUMN IF EXISTS tags;
DROP INDEX IF EXISTS idx_customers_tags;