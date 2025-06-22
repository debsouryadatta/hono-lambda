import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { posts, users, type Post, type NewPost } from '../db/schema';
import { db } from '../db';

const postRoutes = new Hono();

// GET /posts - Get all posts with author information
postRoutes.get('/', async (c) => {
  try {
    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        published: posts.published,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .orderBy(desc(posts.createdAt));

    return c.json({ success: true, data: allPosts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return c.json({ success: false, error: 'Failed to fetch posts' }, 500);
  }
});

// GET /posts/:id - Get post by ID with author information
postRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid post ID' }, 400);
    }

    const post = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        published: posts.published,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.id, id));

    if (post.length === 0) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    return c.json({ success: true, data: post[0] });
  } catch (error) {
    console.error('Error fetching post:', error);
    return c.json({ success: false, error: 'Failed to fetch post' }, 500);
  }
});

// GET /posts/user/:userId - Get posts by user ID
postRoutes.get('/user/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    if (isNaN(userId)) {
      return c.json({ success: false, error: 'Invalid user ID' }, 400);
    }

    const userPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        published: posts.published,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt));

    return c.json({ success: true, data: userPosts });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return c.json({ success: false, error: 'Failed to fetch user posts' }, 500);
  }
});

// POST /posts - Create new post
postRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { title, content, published = false, authorId } = body;

    if (!title || !authorId) {
      return c.json({ success: false, error: 'Title and authorId are required' }, 400);
    }

    // Check if author exists
    const author = await db.select().from(users).where(eq(users.id, authorId));
    if (author.length === 0) {
      return c.json({ success: false, error: 'Author not found' }, 404);
    }

    const newPost: NewPost = {
      title,
      content,
      published,
      authorId,
    };

    const createdPost = await db.insert(posts).values(newPost).returning();
    
    return c.json({ success: true, data: createdPost[0] }, 201);
  } catch (error) {
    console.error('Error creating post:', error);
    return c.json({ success: false, error: 'Failed to create post' }, 500);
  }
});

// PUT /posts/:id - Update post
postRoutes.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid post ID' }, 400);
    }

    const body = await c.req.json();
    const { title, content, published } = body;

    if (!title && !content && published === undefined) {
      return c.json({ success: false, error: 'At least one field (title, content, or published) is required' }, 400);
    }

    const updateData: Partial<NewPost> = {};
    if (title) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (published !== undefined) updateData.published = published;

    const updatedPost = await db
      .update(posts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();

    if (updatedPost.length === 0) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    return c.json({ success: true, data: updatedPost[0] });
  } catch (error) {
    console.error('Error updating post:', error);
    return c.json({ success: false, error: 'Failed to update post' }, 500);
  }
});

// DELETE /posts/:id - Delete post
postRoutes.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (isNaN(id)) {
      return c.json({ success: false, error: 'Invalid post ID' }, 400);
    }

    const deletedPost = await db.delete(posts).where(eq(posts.id, id)).returning();

    if (deletedPost.length === 0) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }

    return c.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return c.json({ success: false, error: 'Failed to delete post' }, 500);
  }
});

export default postRoutes; 