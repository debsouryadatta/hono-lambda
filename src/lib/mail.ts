import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Create SES client
export const sesClient = new SESClient({ 
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });

  
