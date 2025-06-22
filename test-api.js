// Simple test script to demonstrate API usage
// Run this after starting your development server with `pnpm dev`

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🚀 Testing Hono API...\n');

  try {
    // Test health check
    console.log('1. Testing health check...');
    const healthResponse = await fetch('http://localhost:3000/');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    console.log('');

    // Test creating a user
    console.log('2. Creating a user...');
    const createUserResponse = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
      }),
    });
    const newUser = await createUserResponse.json();
    console.log('✅ Created user:', newUser);
    console.log('');

    if (newUser.success && newUser.data) {
      const userId = newUser.data.id;

      // Test getting all users
      console.log('3. Getting all users...');
      const usersResponse = await fetch(`${API_BASE}/users`);
      const users = await usersResponse.json();
      console.log('✅ All users:', users);
      console.log('');

      // Test creating a post
      console.log('4. Creating a post...');
      const createPostResponse = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'My First Post',
          content: 'This is the content of my first post using Hono.js!',
          published: true,
          authorId: userId,
        }),
      });
      const newPost = await createPostResponse.json();
      console.log('✅ Created post:', newPost);
      console.log('');

      // Test getting all posts
      console.log('5. Getting all posts...');
      const postsResponse = await fetch(`${API_BASE}/posts`);
      const posts = await postsResponse.json();
      console.log('✅ All posts:', posts);
      console.log('');

      // Test getting posts by user
      console.log('6. Getting posts by user...');
      const userPostsResponse = await fetch(`${API_BASE}/posts/user/${userId}`);
      const userPosts = await userPostsResponse.json();
      console.log('✅ User posts:', userPosts);
      console.log('');
    }

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('Make sure your development server is running with `pnpm dev`');
  }
}

// Run the test
testAPI(); 