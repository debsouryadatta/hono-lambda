import { Hono } from 'hono';
import { serve } from "@hono/node-server";
import { handle as handleHttpEvents, LambdaEvent } from 'hono/aws-lambda';
import { APIGatewayProxyResult, Context } from 'aws-lambda';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import testRoutes from './routes/tests';
import { queueConfig, SupportedEvent } from './queue-handler';

// Create Hono app
const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'], // Add your frontend domains
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Hono API with AWS Lambda, RDS Aurora PostgreSQL, and Drizzle ORM',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.route('/api/users', userRoutes);
app.route('/api/posts', postRoutes);
app.route('/api/tests', testRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ success: false, error: 'Route not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  return c.json({ success: false, error: 'Internal server error' }, 500);
});

// Export the handler for AWS Lambda
export const handler = async (
  event: SupportedEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  
  // Handle SQS events
  if ("Records" in event && event.Records[0]?.eventSource === "aws:sqs") {
    const queueName = event.Records[0].eventSourceARN.split(":").pop();
    console.log("Queue Name:", queueName);
    await queueConfig[queueName as keyof typeof queueConfig].handler(event);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Event processed successfully" }),
    };
  }

  console.log("Event received:", JSON.stringify(event));

  // Handle EventBridge scheduled events

  // Handle HTTP API events
  return handleHttpEvents(app)(event as LambdaEvent, context);
};

if (process.env.NODE_ENV !== "production") {
  const port = 3000;
  console.log(`Server is running on port ${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}
  