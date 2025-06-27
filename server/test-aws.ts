import { SESClient, ListVerifiedEmailAddressesCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function testAWSConnection() {
  try {
    const command = new ListVerifiedEmailAddressesCommand({});
    const response = await sesClient.send(command);
    console.log("AWS SES Connection: SUCCESS");
    console.log("Verified email addresses:", response.VerifiedEmailAddresses);
    return { success: true, verifiedEmails: response.VerifiedEmailAddresses };
  } catch (error) {
    console.error("AWS SES Connection: FAILED", error);
    return { success: false, error: error.message };
  }
}