import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { fromEnv } from "@aws-sdk/credential-providers";

// Initialize SES client with AWS credentials from environment
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: fromEnv(),
});

export interface QuickQuoteEmailData {
  name: string;
  email: string;
  phone: string;
}

export interface ContactEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string | null;
  service?: string | null;
  employees?: string | null;
  challenges?: string | null;
  contactTime?: string | null;
}

export async function sendQuickQuoteEmail(data: QuickQuoteEmailData): Promise<void> {
  // Use a verified email address - this needs to be verified in AWS SES first
  const sourceEmail = process.env.SES_VERIFIED_EMAIL || "noreply@aramistech.com";
  
  const emailParams = {
    Source: sourceEmail,
    Destination: {
      ToAddresses: ["sales@aramistech.com"],
    },
    Message: {
      Subject: {
        Data: "New Quick Quote Request - AramisTech",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: `
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
                  .content { padding: 20px; }
                  .info-box { background-color: #f8f9fa; border-left: 4px solid #1e40af; padding: 15px; margin: 10px 0; }
                  .contact-info { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                  .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>New Quick Quote Request</h1>
                  <p>AramisTech - Professional IT Solutions</p>
                </div>
                
                <div class="content">
                  <div class="info-box">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${data.name}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Phone:</strong> ${data.phone}</p>
                  </div>
                  
                  <div class="contact-info">
                    <h3>⚡ Quick Response Required</h3>
                    <p>This is a quick quote request from your website. Customer expects contact within 2 hours during business hours.</p>
                  </div>
                  
                  <div class="info-box">
                    <h3>Next Steps</h3>
                    <ul>
                      <li>Contact the customer within 2 hours during business hours</li>
                      <li>Discuss their IT needs and challenges</li>
                      <li>Provide initial consultation and quote</li>
                      <li>Schedule follow-up if needed</li>
                    </ul>
                  </div>
                </div>
                
                <div class="footer">
                  <p>AramisTech - 27+ Years of Professional IT Solutions</p>
                  <p>This email was generated automatically from your website contact form.</p>
                </div>
              </body>
            </html>
          `,
          Charset: "UTF-8",
        },
        Text: {
          Data: `
NEW QUICK QUOTE REQUEST - AramisTech

Customer Information:
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}

⚡ QUICK RESPONSE REQUIRED
This customer expects to be contacted within 2 hours during business hours.

Next Steps:
- Contact the customer immediately
- Discuss their IT needs and challenges
- Provide initial consultation and quote
- Schedule follow-up if needed

---
AramisTech - 27+ Years of Professional IT Solutions
This email was generated automatically from your website.
          `,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);
    console.log(`Quick quote email sent successfully for ${data.name}`);
  } catch (error) {
    console.error("Error sending quick quote email:", error);
    throw new Error("Failed to send quick quote email");
  }
}

export async function sendContactEmail(data: ContactEmailData): Promise<void> {
  // Use a verified email address - this needs to be verified in AWS SES first
  const sourceEmail = process.env.SES_VERIFIED_EMAIL || "noreply@aramistech.com";
  
  const emailParams = {
    Source: sourceEmail,
    Destination: {
      ToAddresses: ["sales@aramistech.com"],
    },
    Message: {
      Subject: {
        Data: "New Contact Form Submission - AramisTech",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: `
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .header { background-color: #1e40af; color: white; padding: 20px; text-align: center; }
                  .content { padding: 20px; }
                  .info-box { background-color: #f8f9fa; border-left: 4px solid #1e40af; padding: 15px; margin: 10px 0; }
                  .contact-info { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                  .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>New Contact Form Submission</h1>
                  <p>AramisTech - Professional IT Solutions</p>
                </div>
                
                <div class="content">
                  <div class="info-box">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Phone:</strong> ${data.phone}</p>
                    ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
                  </div>
                  
                  ${data.service ? `
                  <div class="info-box">
                    <h3>Service Interest</h3>
                    <p>${data.service}</p>
                  </div>
                  ` : ''}
                  
                  ${data.employees ? `
                  <div class="info-box">
                    <h3>Company Size</h3>
                    <p>${data.employees} employees</p>
                  </div>
                  ` : ''}
                  
                  ${data.challenges ? `
                  <div class="info-box">
                    <h3>Current Challenges</h3>
                    <p>${data.challenges}</p>
                  </div>
                  ` : ''}
                  
                  ${data.contactTime ? `
                  <div class="info-box">
                    <h3>Preferred Contact Time</h3>
                    <p>${data.contactTime}</p>
                  </div>
                  ` : ''}
                  
                  <div class="contact-info">
                    <h3>📞 Follow-up Required</h3>
                    <p>Customer expects contact within 2 hours during business hours.</p>
                  </div>
                </div>
                
                <div class="footer">
                  <p>AramisTech - 27+ Years of Professional IT Solutions</p>
                  <p>This email was generated automatically from your website contact form.</p>
                </div>
              </body>
            </html>
          `,
          Charset: "UTF-8",
        },
        Text: {
          Data: `
NEW CONTACT FORM SUBMISSION - AramisTech

Customer Information:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
${data.company ? `Company: ${data.company}` : ''}

${data.service ? `Service Interest: ${data.service}` : ''}
${data.employees ? `Company Size: ${data.employees} employees` : ''}
${data.challenges ? `Current Challenges: ${data.challenges}` : ''}
${data.contactTime ? `Preferred Contact Time: ${data.contactTime}` : ''}

📞 FOLLOW-UP REQUIRED
Customer expects to be contacted within 2 hours during business hours.

---
AramisTech - 27+ Years of Professional IT Solutions
This email was generated automatically from your website.
          `,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);
    console.log(`Contact email sent successfully for ${data.firstName} ${data.lastName}`);
  } catch (error) {
    console.error("Error sending contact email:", error);
    throw new Error("Failed to send contact email");
  }
}