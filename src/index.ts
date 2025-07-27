import { Hono } from 'hono';
import { serve } from "@hono/node-server";
import { handle } from 'hono/aws-lambda';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import testRoutes from './routes/tests';

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
export const handler = handle(app); 

if (process.env.NODE_ENV !== "production") {
  const port = 3000;
  console.log(`Server is running on port ${port}`);
  serve({
    fetch: app.fetch,
    port,
  });
}
  