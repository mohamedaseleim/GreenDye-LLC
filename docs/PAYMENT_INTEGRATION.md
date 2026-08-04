# Payment Gateway Integration Guide

This guide provides detailed instructions for integrating payment gateways with GreenDye Academy platform.

## Overview

GreenDye Academy supports multiple payment gateways to serve different regions:

- **International**: Stripe, PayPal
- **Egypt & MENA**: Fawry, Paymob

## Payment Gateway Setup

### 1. Stripe Integration (International)

#### Getting Started

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Install Stripe SDK:

```bash
cd backend
npm install stripe
```

#### Configuration

Add to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### Implementation Steps

1. **Initialize Stripe in your backend**

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```

2. **Create payment intent**

The payment controller already has a placeholder for Stripe integration. Update the `createStripeCheckout` function in `controllers/paymentController.js`:

```javascript
async function createStripeCheckout(payment, course) {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: payment.currency.toLowerCase(),
          product_data: {
            name: course.title.en,
            description: course.description.en,
          },
          unit_amount: Math.round(payment.amount * 100), // Amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    metadata: {
      paymentId: payment._id.toString(),
      userId: payment.user.toString(),
      courseId: course._id.toString()
    }
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    publicKey: process.env.STRIPE_PUBLIC_KEY
  };
}
```

3. **Set up webhook endpoint** for payment verification

### 2. PayPal Integration (International)

#### Getting Started

1. Create a PayPal Business account at [https://paypal.com](https://paypal.com)
2. Get your credentials from PayPal Developer Dashboard
3. Install PayPal SDK:

```bash
npm install @paypal/checkout-server-sdk
```

#### Configuration

Add to your `.env` file:

```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox # Change to 'live' for production
```

#### Implementation

Update the `createPayPalCheckout` function:

```javascript
async function createPayPalCheckout(payment, course) {
  const paypal = require('@paypal/checkout-server-sdk');
  
  // Configure environment
  const environment = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );
  
  const client = new paypal.core.PayPalHttpClient(environment);
  
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: payment.currency,
        value: payment.amount.toFixed(2)
      },
      description: course.title.en,
      reference_id: payment._id.toString()
    }],
    application_context: {
      return_url: `${process.env.FRONTEND_URL}/payment/paypal/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
    }
  });

  const order = await client.execute(request);
  
  return {
    checkoutUrl: order.result.links.find(l => l.rel === 'approve').href,
    orderId: order.result.id,
    clientId: process.env.PAYPAL_CLIENT_ID
  };
}
```

### 3. Fawry Integration (Egypt)

#### Getting Started

1. Contact Fawry to get merchant credentials
2. Review Fawry API documentation
3. Install required packages:

```bash
npm install axios crypto
```

#### Configuration

Add to your `.env` file:

```env
FAWRY_MERCHANT_CODE=your_fawry_merchant_code
FAWRY_SECURITY_KEY=your_fawry_security_key
FAWRY_API_URL=https://atfawry.fawrystaging.com
```

#### Implementation

Update the `createFawryCheckout` function:

```javascript
async function createFawryCheckout(payment, course) {
  const axios = require('axios');
  const crypto = require('crypto');
  
  const merchantRefNum = payment._id.toString();
  const amount = payment.amount.toFixed(2);
  
  // Generate signature
  const signatureString = `${process.env.FAWRY_MERCHANT_CODE}${merchantRefNum}${amount}${process.env.FAWRY_SECURITY_KEY}`;
  const signature = crypto.createHash('sha256').update(signatureString).digest('hex');
  
  const requestData = {
    merchantCode: process.env.FAWRY_MERCHANT_CODE,
    merchantRefNum,
    customerProfileId: payment.user.toString(),
    paymentMethod: 'CARD',
    amount,
    currencyCode: 'EGP',
    description: course.title.ar || course.title.en,
    signature,
    returnUrl: `${process.env.FRONTEND_URL}/payment/fawry/callback`,
    language: 'ar-eg'
  };

  const response = await axios.post(
    `${process.env.FAWRY_API_URL}/ECommerceWeb/Fawry/payments/charge`,
    requestData
  );

  return {
    checkoutUrl: response.data.redirectUrl,
    referenceNumber: response.data.referenceNumber,
    merchantCode: process.env.FAWRY_MERCHANT_CODE
  };
}
```

### 4. Paymob Integration (Egypt & MENA)

#### Getting Started

1. Register at [https://paymob.com](https://paymob.com)
2. Complete merchant verification
3. Get API credentials from dashboard

#### Configuration

Add to your `.env` file:

```env
PAYMOB_API_KEY=your_paymob_api_key
PAYMOB_INTEGRATION_ID=your_paymob_integration_id
PAYMOB_IFRAME_ID=your_paymob_iframe_id
```

#### Implementation

Update the `createPaymobCheckout` function:

```javascript
async function createPaymobCheckout(payment, course) {
  const axios = require('axios');
  
  // Step 1: Authentication
  const authResponse = await axios.post(
    'https://accept.paymob.com/api/auth/tokens',
    { api_key: process.env.PAYMOB_API_KEY }
  );
  const authToken = authResponse.data.token;

  // Step 2: Create order
  const orderResponse = await axios.post(
    'https://accept.paymob.com/api/ecommerce/orders',
    {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: Math.round(payment.amount * 100),
      currency: payment.currency,
      merchant_order_id: payment._id.toString(),
      items: [{
        name: course.title.en,
        amount_cents: Math.round(payment.amount * 100),
        quantity: 1
      }]
    }
  );

  // Step 3: Get payment key
  const paymentKeyResponse = await axios.post(
    'https://accept.paymob.com/api/acceptance/payment_keys',
    {
      auth_token: authToken,
      amount_cents: Math.round(payment.amount * 100),
      expiration: 3600,
      order_id: orderResponse.data.id,
      billing_data: {
        email: "user@example.com", // Get from user profile
        first_name: "User",
        last_name: "Name",
        phone_number: "+20xxxxxxxxxx",
        country: "EG",
        city: "Cairo",
        street: "N/A",
        building: "N/A",
        floor: "N/A",
        apartment: "N/A"
      },
      currency: payment.currency,
      integration_id: process.env.PAYMOB_INTEGRATION_ID
    }
  );

  return {
    checkoutUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKeyResponse.data.token}`,
    paymentToken: paymentKeyResponse.data.token,
    integrationId: process.env.PAYMOB_INTEGRATION_ID
  };
}
```

## Webhook Configuration

### Setting up Webhooks

Each payment gateway requires webhook endpoints to receive payment notifications:

#### Stripe Webhooks

```javascript
// Add to paymentRoutes.js
router.post('/webhook/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Update payment status
      await Payment.findByIdAndUpdate(
        session.metadata.paymentId,
        {
          status: 'completed',
          transactionId: session.payment_intent,
          completedAt: Date.now()
        }
      );
      
      // Create enrollment
      await Enrollment.create({
        user: session.metadata.userId,
        course: session.metadata.courseId,
        enrollmentDate: Date.now(),
        status: 'active'
      });
    }
    
    res.json({received: true});
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

## Testing Payment Integration

### Test Mode

All payment gateways provide test/sandbox modes:

1. **Stripe Test Cards**:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

2. **PayPal Sandbox**: Use sandbox accounts for testing

3. **Fawry/Paymob**: Contact provider for test credentials

### Testing Checklist

- [ ] Payment creation works
- [ ] Redirect to payment gateway
- [ ] Successful payment callback
- [ ] Failed payment callback
- [ ] Webhook verification
- [ ] Enrollment creation on success
- [ ] Email notification sent
- [ ] Invoice generation

## Currency Conversion

The platform supports multiple currencies. Update course prices:

```javascript
// In Course model
price: {
  USD: Number,
  EUR: Number,
  EGP: Number,
  SAR: Number,
  NGN: Number
}
```

Use a currency conversion API (optional):

```bash
npm install currency-converter-lt
```

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Validate all webhooks** using signatures
3. **Use HTTPS** for all payment transactions
4. **Implement rate limiting** on payment endpoints
5. **Log all payment transactions** for audit
6. **Store sensitive data encrypted** in database
7. **Implement fraud detection** mechanisms
8. **Regular security audits** of payment flow

## Refund Policy Implementation

Configure refund rules in `paymentController.js`:

```javascript
// Refund window (days)
const REFUND_WINDOW_DAYS = 30;

// Refund percentage based on time
function calculateRefundAmount(payment, requestDate) {
  const daysSincePurchase = (requestDate - payment.completedAt) / (1000 * 60 * 60 * 24);
  
  if (daysSincePurchase <= 7) {
    return payment.amount; // 100% refund
  } else if (daysSincePurchase <= 14) {
    return payment.amount * 0.75; // 75% refund
  } else if (daysSincePurchase <= 30) {
    return payment.amount * 0.50; // 50% refund
  } else {
    return 0; // No refund
  }
}
```

## Monitoring and Analytics

Track payment metrics:

- Total revenue
- Success rate
- Failed payments
- Refund rate
- Popular payment methods by region
- Average transaction value

## Troubleshooting

### Common Issues

1. **Payment not completing**
   - Check webhook configuration
   - Verify API credentials
   - Check server logs

2. **Enrollment not created**
   - Verify webhook received
   - Check enrollment controller
   - Review database logs

3. **Currency conversion issues**
   - Validate course prices
   - Check currency codes

## Support

For payment integration support:
- Documentation: [Link to docs]
- Email: payments@greendye-academy.com
- Telegram: [Support channel]

## References

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com)
- [Fawry API Docs](https://fawry.com/developers)
- [Paymob Documentation](https://paymob.com/docs)
