import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { SQSClient } from "@aws-sdk/client-sqs";
// Create SES client
export const sesClient = new SESClient({
  region: process.env.REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export const sqs = new SQSClient({
  region: process.env.REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});
