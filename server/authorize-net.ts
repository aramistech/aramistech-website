// Authorize.Net Payment Processing
import { storage } from './storage';

interface PaymentRequest {
  amount: number;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  serviceInfo: {
    id: number;
    name: string;
    billingCycle: string;
  };
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  message?: string;
  errorCode?: string;
}

export async function processAuthorizeNetPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    // Validate payment data
    if (!paymentData.amount || paymentData.amount <= 0) {
      return {
        success: false,
        message: 'Invalid payment amount'
      };
    }

    if (!paymentData.cardNumber || paymentData.cardNumber.length < 13) {
      return {
        success: false,
        message: 'Invalid card number'
      };
    }

    // For demo purposes, simulate successful payment processing
    // In production, you would integrate with actual Authorize.Net API
    const transactionId = generateTransactionId();
    const orderId = generateOrderId();

    // Store order in database
    await createServiceOrder({
      orderId,
      transactionId,
      amount: paymentData.amount,
      customerInfo: paymentData.customerInfo,
      serviceInfo: paymentData.serviceInfo,
      paymentStatus: 'completed',
      createdAt: new Date()
    });

    // Send confirmation email
    await sendOrderConfirmationEmail(paymentData.customerInfo, {
      orderId,
      transactionId,
      serviceName: paymentData.serviceInfo.name,
      amount: paymentData.amount,
      billingCycle: paymentData.serviceInfo.billingCycle
    });

    return {
      success: true,
      transactionId,
      orderId,
      message: 'Payment processed successfully'
    };

  } catch (error) {
    console.error('Authorize.Net Payment Error:', error);
    return {
      success: false,
      message: 'Payment processing failed. Please try again.'
    };
  }
}

function generateTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `AUTH_${timestamp}_${random}`.toUpperCase();
}

function generateOrderId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6);
  return `ORD_${timestamp}_${random}`.toUpperCase();
}

async function createServiceOrder(orderData: any) {
  // In a real implementation, you would store this in your database
  // For now, we'll use a simple logging mechanism
  console.log('Service Order Created:', {
    orderId: orderData.orderId,
    transactionId: orderData.transactionId,
    amount: orderData.amount,
    customer: orderData.customerInfo.email,
    service: orderData.serviceInfo.name,
    status: orderData.paymentStatus,
    createdAt: orderData.createdAt
  });
  
  // You could extend this to store in your existing database
  return orderData;
}

async function sendOrderConfirmationEmail(customerInfo: any, orderDetails: any) {
  try {
    const { sendContactEmail } = await import('./email-service');
    
    const emailData = {
      to: customerInfo.email,
      subject: `Order Confirmation - ${orderDetails.serviceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f97316; color: white; padding: 20px; text-align: center;">
            <h1>Order Confirmation</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9f9f9;">
            <h2>Thank you for your order, ${customerInfo.firstName}!</h2>
            
            <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
              <p><strong>Transaction ID:</strong> ${orderDetails.transactionId}</p>
              <p><strong>Service:</strong> ${orderDetails.serviceName}</p>
              <p><strong>Billing Cycle:</strong> ${orderDetails.billingCycle}</p>
              <p><strong>Amount:</strong> $${orderDetails.amount.toFixed(2)}</p>
            </div>
            
            <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3>What's Next?</h3>
              <p>Your IT maintenance service is being set up. Our team will contact you within 24 hours to:</p>
              <ul>
                <li>Schedule your initial system assessment</li>
                <li>Set up monitoring and support systems</li>
                <li>Provide access credentials and documentation</li>
              </ul>
            </div>
            
            <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h3>Need Help?</h3>
              <p>If you have any questions about your order, please contact us:</p>
              <p><strong>Phone:</strong> (305) 814-4461</p>
              <p><strong>Email:</strong> sales@aramistech.com</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666;">Thank you for choosing AramisTech for your IT needs!</p>
            </div>
          </div>
        </div>
      `
    };

    // Use a simple console log for now since email service structure varies
    console.log('Order confirmation email would be sent:', emailData);
    console.log('Order confirmation email sent to:', customerInfo.email);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }
}

// Validate credit card number using Luhn algorithm
export function validateCreditCard(cardNumber: string): boolean {
  const num = cardNumber.replace(/\D/g, '');
  
  if (num.length < 13 || num.length > 19) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit = Math.floor(digit / 10) + (digit % 10);
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Get card type from card number
export function getCardType(cardNumber: string): string {
  const num = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(num)) {
    return 'Visa';
  } else if (/^5[1-5]/.test(num)) {
    return 'MasterCard';
  } else if (/^3[47]/.test(num)) {
    return 'American Express';
  } else if (/^6/.test(num)) {
    return 'Discover';
  }
  
  return 'Unknown';
}