import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { posts, users, type Post, type NewPost } from '../db/schema';
import { db } from '../db';
import { sesClient } from '../lib/mail';
import { SendEmailCommand } from '@aws-sdk/client-ses';

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


export default testRoutes;