import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// Initialize SES client with AWS credentials from environment
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
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

export interface AIConsultationEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string | null;
  industry?: string | null;
  businessSize?: string | null;
  currentAIUsage?: string | null;
  aiInterests: string[];
  projectTimeline?: string | null;
  budget?: string | null;
  projectDescription: string;
  preferredContactTime?: string | null;
}

export interface ITConsultationEmailData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string | null;
  employees?: string | null;
  services: string[];
  urgency?: string | null;
  budget?: string | null;
  challenges: string;
  preferredContactTime?: string | null;
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
    console.log(`✅ Quick quote email sent successfully for ${data.name}`);
  } catch (error) {
    console.error("❌ Error sending quick quote email:", error);
    
    // Log the quote details for manual follow-up
    console.log(`📋 MANUAL FOLLOW-UP REQUIRED:`);
    console.log(`   Customer: ${data.name}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Phone: ${data.phone}`);
    console.log(`   Time: ${new Date().toISOString()}`);
    
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

export async function sendAIConsultationEmail(data: AIConsultationEmailData): Promise<void> {
  const sourceEmail = process.env.SES_VERIFIED_EMAIL || "noreply@aramistech.com";
  
  const emailParams = {
    Source: sourceEmail,
    Destination: {
      ToAddresses: ["sales@aramistech.com"],
    },
    Message: {
      Subject: {
        Data: "AI Development Consultation - AramisTech",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: `
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
                  .content { padding: 20px; }
                  .info-box { background-color: #f8f9fa; border-left: 4px solid #f97316; padding: 15px; margin: 10px 0; }
                  .ai-interests { background-color: #e0f2fe; border-left: 4px solid #0277bd; padding: 15px; margin: 20px 0; }
                  .project-details { background-color: #f3e5f5; border-left: 4px solid #7b1fa2; padding: 15px; margin: 20px 0; }
                  .contact-info { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                  .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                  .ai-list { margin: 10px 0; }
                  .ai-list li { margin: 5px 0; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>🤖 AI Development Consultation Request</h1>
                  <p>AramisTech - Professional AI Solutions</p>
                </div>
                
                <div class="content">
                  <div class="info-box">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Phone:</strong> ${data.phone}</p>
                    ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
                    ${data.industry ? `<p><strong>Industry:</strong> ${data.industry}</p>` : ''}
                    ${data.businessSize ? `<p><strong>Business Size:</strong> ${data.businessSize}</p>` : ''}
                  </div>
                  
                  <div class="ai-interests">
                    <h3>🎯 AI Solutions of Interest</h3>
                    <ul class="ai-list">
                      ${data.aiInterests.map(interest => `<li>${interest}</li>`).join('')}
                    </ul>
                    ${data.currentAIUsage ? `<p><strong>Current AI Usage:</strong> ${data.currentAIUsage}</p>` : ''}
                  </div>
                  
                  <div class="project-details">
                    <h3>📋 Project Details</h3>
                    <p><strong>Project Description:</strong></p>
                    <p style="background-color: white; padding: 10px; border-radius: 5px;">${data.projectDescription}</p>
                    ${data.projectTimeline ? `<p><strong>Timeline:</strong> ${data.projectTimeline}</p>` : ''}
                    ${data.budget ? `<p><strong>Budget Range:</strong> ${data.budget}</p>` : ''}
                    ${data.preferredContactTime ? `<p><strong>Preferred Contact Time:</strong> ${data.preferredContactTime}</p>` : ''}
                  </div>
                  
                  <div class="contact-info">
                    <h3>🚀 AI Consultation Required</h3>
                    <p>Customer is interested in AI development services and expects expert consultation within 2 hours during business hours.</p>
                    <p><strong>This is a high-value AI development lead - prioritize immediate follow-up!</strong></p>
                  </div>
                </div>
                
                <div class="footer">
                  <p>AramisTech - 27+ Years of Professional IT Solutions</p>
                  <p>This email was generated automatically from your AI Development consultation form.</p>
                </div>
              </body>
            </html>
          `,
          Charset: "UTF-8",
        },
        Text: {
          Data: `
AI DEVELOPMENT CONSULTATION REQUEST - AramisTech

Customer Information:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
${data.company ? `Company: ${data.company}` : ''}
${data.industry ? `Industry: ${data.industry}` : ''}
${data.businessSize ? `Business Size: ${data.businessSize}` : ''}

AI Solutions of Interest:
${data.aiInterests.map(interest => `- ${interest}`).join('\n')}
${data.currentAIUsage ? `Current AI Usage: ${data.currentAIUsage}` : ''}

Project Details:
Project Description: ${data.projectDescription}
${data.projectTimeline ? `Timeline: ${data.projectTimeline}` : ''}
${data.budget ? `Budget Range: ${data.budget}` : ''}
${data.preferredContactTime ? `Preferred Contact Time: ${data.preferredContactTime}` : ''}

🚀 AI CONSULTATION REQUIRED
Customer is interested in AI development services and expects expert consultation within 2 hours during business hours.
THIS IS A HIGH-VALUE AI DEVELOPMENT LEAD - PRIORITIZE IMMEDIATE FOLLOW-UP!

---
AramisTech - 27+ Years of Professional IT Solutions
This email was generated automatically from your AI Development consultation form.
          `,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);
    console.log(`AI consultation email sent successfully for ${data.firstName} ${data.lastName}`);
  } catch (error) {
    console.error("Error sending AI consultation email:", error);
    throw new Error("Failed to send AI consultation email");
  }
}

export async function sendITConsultationEmail(data: ITConsultationEmailData): Promise<void> {
  const sourceEmail = process.env.SES_VERIFIED_EMAIL || "noreply@aramistech.com";
  
  const emailParams = {
    Source: sourceEmail,
    Destination: {
      ToAddresses: ["sales@aramistech.com"],
    },
    Message: {
      Subject: {
        Data: "IT Services Consultation - AramisTech",
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: `
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
                  .content { padding: 20px; }
                  .info-box { background-color: #f8f9fa; border-left: 4px solid #f97316; padding: 15px; margin: 10px 0; }
                  .services-box { background-color: #e0f2fe; border-left: 4px solid #0277bd; padding: 15px; margin: 20px 0; }
                  .challenges-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                  .contact-info { background-color: #f3e5f5; border-left: 4px solid #7b1fa2; padding: 15px; margin: 20px 0; }
                  .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
                  .services-list { margin: 10px 0; }
                  .services-list li { margin: 5px 0; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>🛠️ IT Services Consultation Request</h1>
                  <p>AramisTech - Professional IT Solutions</p>
                </div>
                
                <div class="content">
                  <div class="info-box">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Phone:</strong> ${data.phone}</p>
                    ${data.company ? `<p><strong>Company:</strong> ${data.company}</p>` : ''}
                    ${data.employees ? `<p><strong>Number of Employees:</strong> ${data.employees}</p>` : ''}
                  </div>
                  
                  <div class="services-box">
                    <h3>🎯 IT Services Needed</h3>
                    <ul class="services-list">
                      ${data.services.map(service => `<li>${service}</li>`).join('')}
                    </ul>
                    ${data.urgency ? `<p><strong>Urgency Level:</strong> ${data.urgency}</p>` : ''}
                    ${data.budget ? `<p><strong>Budget Range:</strong> ${data.budget}</p>` : ''}
                  </div>
                  
                  <div class="challenges-box">
                    <h3>🚨 IT Challenges</h3>
                    <p style="background-color: white; padding: 10px; border-radius: 5px;">${data.challenges}</p>
                    ${data.preferredContactTime ? `<p><strong>Preferred Contact Time:</strong> ${data.preferredContactTime}</p>` : ''}
                  </div>
                  
                  <div class="contact-info">
                    <h3>📞 Consultation Required</h3>
                    <p>Customer has IT challenges and expects expert consultation within 2 hours during business hours.</p>
                    <p><strong>This lead came from exit intent popup - they were about to leave!</strong></p>
                  </div>
                </div>
                
                <div class="footer">
                  <p>AramisTech - 27+ Years of Professional IT Solutions</p>
                  <p>This email was generated automatically from your exit intent consultation form.</p>
                </div>
              </body>
            </html>
          `,
          Charset: "UTF-8",
        },
        Text: {
          Data: `
IT SERVICES CONSULTATION REQUEST - AramisTech

Customer Information:
Name: ${data.firstName} ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
${data.company ? `Company: ${data.company}` : ''}
${data.employees ? `Number of Employees: ${data.employees}` : ''}

IT Services Needed:
${data.services.map(service => `- ${service}`).join('\n')}

Project Details:
${data.urgency ? `Urgency Level: ${data.urgency}` : ''}
${data.budget ? `Budget Range: ${data.budget}` : ''}

IT Challenges:
${data.challenges}

${data.preferredContactTime ? `Preferred Contact Time: ${data.preferredContactTime}` : ''}

📞 CONSULTATION REQUIRED
Customer has IT challenges and expects expert consultation within 2 hours during business hours.
THIS LEAD CAME FROM EXIT INTENT POPUP - THEY WERE ABOUT TO LEAVE!

---
AramisTech - 27+ Years of Professional IT Solutions
This email was generated automatically from your exit intent consultation form.
          `,
          Charset: "UTF-8",
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(emailParams);
    await sesClient.send(command);
    console.log(`IT consultation email sent successfully for ${data.firstName} ${data.lastName}`);
  } catch (error) {
    console.error("Error sending IT consultation email:", error);
    throw new Error("Failed to send IT consultation email");
  }
}