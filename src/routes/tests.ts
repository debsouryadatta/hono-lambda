import { Hono } from 'hono';
import { sesClient } from '../lib/instance';
import { SendEmailCommand } from '@aws-sdk/client-ses';
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqs } from "../lib/instance";
import { pushToQueue } from '../queue-handler';

const testRoutes = new Hono();

// Test SES send mail with nodemailer
testRoutes.post('/send-mail', async (c) => {
    try {
        const { to, subject, message, html } = await c.req.json();
    
        const params = {
          Source: process.env.FROM_EMAIL,
          Destination: {
            ToAddresses: [to]
          },
          Message: {
            Subject: {
              Data: subject,
              Charset: 'UTF-8'
            },
            Body: {
              Text: {
                Data: message,
                Charset: 'UTF-8'
              },
              Html: {
                Data: html || `<p>${message}</p>`,
                Charset: 'UTF-8'
              }
            }
          }
        };
    
        const command = new SendEmailCommand(params);
        const result = await sesClient.send(command);
        
        return c.json({ 
          status: 'success', 
          messageId: result.MessageId 
        });
      } catch (error) {
        console.error('Error sending email:', error);
        return c.json({ 
          status: 'error', 
          message: 'Failed to send email' 
        }, 500);
      }
});

// Test SQS send message
testRoutes.post('/send-sqs', async (c) => {
    try {
        const { message } = await c.req.json();
    
        const result = await pushToQueue("hono-lambda", message);
        
        return c.json({ 
          status: 'success', 
          messageId: result 
        });
      } catch (error) {
        console.error('Error sending message to SQS:', error);
        return c.json({ 
          status: 'error', 
          message: 'Failed to send message to SQS' 
        }, 500);
      }
});

export default testRoutes;