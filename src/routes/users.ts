import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users, type User, type NewUser } from '../db/schema';
import { db } from '../db';

const userRoutes = new Hono();

// GET /users - Get all users
userRoutes.get('/', async (c) => {
  try {
    const allUsers = await db.select().from(users);
    return c.json({ success: true, data: allUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ success: false, error: 'Failed to fetch users' }, 500);
  }
});

// GET /users/:id - Get user by ID
userRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    const user = await db.select().from(users).where(eq(users.id, id));
    
    if (user.length === 0) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    return c.json({ success: true, data: user[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ success: false, error: 'Failed to fetch user' }, 500);
  }
});

// POST /users - Create new user
userRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { email, name } = body;

    if (!email || !name) {
      return c.json({ success: false, error: 'Email and name are required' }, 400);
    }

    const newUser: NewUser = {
      email,
      name,
    };

    const createdUser = await db.insert(users).values(newUser).returning();
    
    return c.json({ success: true, data: createdUser[0] }, 201);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return c.json({ success: false, error: 'Email already exists' }, 409);
    }
    return c.json({ success: false, error: 'Failed to create user' }, 500);
  }
});

// PUT /users/:id - Update user
userRoutes.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    const body = await c.req.json();
    const { email, name } = body;

    if (!email && !name) {
      return c.json({ success: false, error: 'At least one field (email or name) is required' }, 400);
    }

    const updateData: Partial<NewUser> = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;

    const updatedUser = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (updatedUser.length === 0) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    return c.json({ success: true, data: updatedUser[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return c.json({ success: false, error: 'Email already exists' }, 409);
    }
    return c.json({ success: false, error: 'Failed to update user' }, 500);
  }
});

// DELETE /users/:id - Delete user
userRoutes.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();

    if (deletedUser.length === 0) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    return c.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ success: false, error: 'Failed to delete user' }, 500);
  }
});

export default userRoutes; 