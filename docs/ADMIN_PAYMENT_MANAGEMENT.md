# Admin Payment/Financial Management Features

This document describes the Payment/Financial Management features available in the GreenDye Academy admin dashboard.

## Overview

The Admin Payment Management system provides comprehensive tools for managing payments, processing refunds, analyzing revenue, and configuring payment gateways. All features are accessible only to users with admin role.

## Features

### 1. View All Transactions

Access the complete list of all payment transactions in the system with advanced filtering and search capabilities.

**Location:** Admin Dashboard → Payments Tab → All Transactions

**Features:**
- **Pagination:** Navigate through large transaction datasets
- **Filtering:**
  - Status (Completed, Pending, Failed, Refunded)
  - Payment Method (Stripe, PayPal, Fawry, Paymob)
  - Currency (USD, EUR, EGP, SAR, NGN)
  - Date Range
- **Transaction Details:**
  - Transaction ID
  - Date and time
  - User information (name and email)
  - Course details
  - Amount and currency
  - Payment method
  - Status with color coding
  - Metadata (IP address, country)
- **Export:** Download transactions as CSV for reporting
- **Detail View:** Click any transaction to view complete details

**API Endpoints:**
```
GET /api/admin/payments
  Query Parameters:
    - status: Filter by payment status
    - paymentMethod: Filter by payment method
    - currency: Filter by currency
    - startDate: Filter transactions after this date
    - endDate: Filter transactions before this date
    - page: Page number (default: 1)
    - limit: Results per page (default: 20)
```

### 2. Refund Request Approval

Manage customer refund requests with a streamlined approval workflow.

**Location:** Admin Dashboard → Payments Tab → Refund Requests

**Features:**
- **View All Requests:** See all refund requests with status indicators
- **Request Details:**
  - Date submitted
  - User information
  - Original payment amount
  - Reason for refund
  - Current status (Pending, Approved, Rejected)
- **Actions:**
  - **Approve:** Process the refund through the payment gateway
  - **Reject:** Decline the refund request with optional reason
- **Status Tracking:** See who processed the request and when

**Workflow:**
1. User submits refund request
2. Request appears in admin panel with "Pending" status
3. Admin reviews request details
4. Admin approves or rejects:
   - **Approve:** System automatically processes refund via payment gateway
   - **Reject:** Admin can provide rejection reason to user
5. Status updates and user is notified

**API Endpoints:**
```
GET /api/refunds
  Query Parameters:
    - status: Filter by request status (pending, approved, rejected)

PUT /api/refunds/:id/approve
  - Processes refund through payment gateway
  - Updates payment and refund request records

PUT /api/refunds/:id/reject
  Body:
    - responseMessage: Optional rejection reason
```

### 3. Revenue Analytics and Reports

Comprehensive revenue analytics with multiple views and breakdowns.

**Location:** Admin Dashboard → Payments Tab → Revenue Analytics

**Features:**

#### Overall Statistics
- Total revenue across all payments
- Total number of transactions
- Average transaction value

#### Revenue by Currency
- Breakdown of revenue by each supported currency
- Number of transactions per currency
- Average transaction value per currency

#### Revenue by Payment Method
- Revenue generated through each payment gateway
- Transaction count per payment method
- Helps identify preferred payment methods

#### Revenue Over Time
- Time-series revenue data
- Grouping options:
  - Daily
  - Weekly
  - Monthly (default)
- Trend analysis for business insights

#### Top Revenue-Generating Courses
- List of courses generating the most revenue
- Revenue amount per course
- Number of enrollments per course
- Helps identify most profitable content

#### Refund Statistics
- Total amount refunded
- Number of refunds processed
- Refund rate analysis

**API Endpoints:**
```
GET /api/admin/payments/analytics/revenue
  Query Parameters:
    - startDate: Start date for analytics period
    - endDate: End date for analytics period
    - groupBy: Time grouping (day, week, month)
```

### 4. Payment Gateway Configuration

View and manage payment gateway configurations.

**Location:** Admin Dashboard → Payments Tab → Gateway Config

**Features:**
- **View Gateway Status:**
  - Stripe
  - PayPal
  - Fawry
  - Paymob
- **Status Indicators:**
  - **Configured:** Whether gateway credentials are set
  - **Enabled:** Whether gateway is active
- **Security Notice:** Reminder that credentials are managed via environment variables

**Configuration Management:**
Payment gateway credentials are managed through environment variables for security:

```env
# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Fawry
FAWRY_MERCHANT_CODE=your_fawry_merchant_code
FAWRY_SECRET_KEY=your_fawry_secret_key

# Paymob
PAYMOB_API_KEY=your_paymob_api_key
```

**API Endpoints:**
```
GET /api/admin/payments/gateway-config
  - Returns configuration status for all gateways

PUT /api/admin/payments/gateway-config
  - Returns instructions for updating via environment variables
```

### 5. Payment Statistics Dashboard

Quick overview of key payment metrics.

**Location:** Admin Dashboard → Payments Tab (Top Cards)

**Metrics:**
- **Total Payments:** Count of all payment records
- **This Month Revenue:** Revenue for current month
- **Today's Revenue:** Revenue for current day
- **Pending Refund Requests:** Count of unprocessed refund requests

**API Endpoints:**
```
GET /api/admin/payments/stats
  - Returns summary statistics for dashboard cards
```

### 6. Transaction Export

Export transaction data for external reporting and analysis.

**Location:** Admin Dashboard → Payments Tab → All Transactions → Export CSV

**Features:**
- Export all visible transactions based on current filters
- CSV format for Excel/spreadsheet compatibility
- Includes:
  - Transaction ID
  - Invoice number
  - Date
  - User name and email
  - Course title
  - Amount and currency
  - Payment method
  - Status

**API Endpoints:**
```
GET /api/admin/payments/export
  Query Parameters:
    - format: Export format (json, csv)
    - startDate: Filter start date
    - endDate: Filter end date
```

## Access Control

All payment management features require admin authorization:
- User must be authenticated (valid JWT token)
- User role must be 'admin'
- Unauthorized access returns 403 Forbidden

## Navigation

### From Admin Dashboard:
1. Go to Admin Dashboard (`/admin/dashboard`)
2. Click on "Payments" tab in the navigation
3. Choose from available tabs:
   - All Transactions
   - Revenue Analytics
   - Refund Requests
   - Gateway Config

### Direct Access:
- Navigate to `/admin/payments`

## Security Considerations

1. **Authorization:** All endpoints require admin role
2. **Sensitive Data:** Payment gateway credentials never exposed via API
3. **Audit Trail:** All refund approvals/rejections are logged with admin user ID
4. **Transaction Integrity:** Original payment records are never deleted, only status updated
5. **PCI Compliance:** No credit card data stored in application database

## Best Practices

### For Refund Management:
1. Review refund reason before approving
2. Check user's course progress (refunds not allowed if progress > 30% by default)
3. Verify refund is within policy window (30 days by default)
4. Provide clear rejection reasons when declining requests

### For Revenue Analysis:
1. Use date filters for period-specific analysis
2. Export data regularly for backup and external reporting
3. Monitor refund rates to identify potential issues
4. Track top-performing courses for content strategy

### For Gateway Configuration:
1. Keep credentials secure in environment variables
2. Never commit credentials to version control
3. Use separate credentials for development and production
4. Regularly rotate API keys
5. Monitor gateway status for any service interruptions

## Troubleshooting

### Transactions Not Showing:
- Check filters - clear all filters to see all transactions
- Verify date range is appropriate
- Ensure pagination is on correct page

### Refund Approval Fails:
- Check payment gateway connectivity
- Verify payment status is 'completed'
- Ensure payment hasn't been refunded already
- Check payment gateway API credentials

### Export Not Working:
- Verify filters allow some transactions
- Check browser download settings
- Try JSON format if CSV fails

### Gateway Shows "Not Configured":
- Verify environment variables are set
- Check .env file has correct keys
- Restart server after updating environment variables

## API Reference

For complete API documentation including request/response formats and error codes, see the main [API Reference](API_REFERENCE.md).

## Support

For issues or questions regarding payment management:
- Check application logs for detailed error messages
- Review payment gateway dashboards for transaction status
- Contact support at support@greendye-academy.com
