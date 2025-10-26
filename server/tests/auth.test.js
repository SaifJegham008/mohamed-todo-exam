const request = require('supertest');
const app = require('../app');
const db = require('../db');
const bcrypt = require('bcrypt');

describe(' Authentication Tests', () => {
  
  // Helper function to create test user
  const createTestUser = async (email, password) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    return db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashedPassword);
  };

  // Clean up database before each test
  beforeEach(() => {
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM users').run();
  });

  // Helper function to register user
  const registerUser = async (email, password) => {
    return request(app)
      .post('/auth/register')
      .send({ email, password });
  };

  // Helper function to login user
  const loginUser = async (email, password) => {
    return request(app)
      .post('/auth/login')
      .send({ email, password });
  };

  describe(' User Registration', () => {
    it(' Should register new user successfully', async () => {
      const response = await registerUser('saif@gmail.com', 'password123');
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe('saif@gmail.com');
      expect(response.body.user.password).toBeUndefined();
    });

    it(' Should reject missing email', async () => {
      const response = await registerUser('', 'password123');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    it(' Should reject missing password', async () => {
      const response = await registerUser('saif@gmail.com', '');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });

    it(' Should reject invalid email format', async () => {
      const response = await registerUser('invalid-email', 'password123');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email format');
    });

    it(' Should reject short password', async () => {
      const response = await registerUser('saif@gmail.com', '1234567');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Password must be at least 8 characters long');
    });

    it(' Should reject duplicate email', async () => {
      // Register first user
      await registerUser('saif@gmail.com', 'password123');
      
      // Try to register with same email
      const response = await registerUser('saif@gmail.com', 'password123');
      
      expect(response.status).toBe(409);
      expect(response.body.error).toBe('User with this email already exists');
    });
  });

  describe(' User Login', () => {
    beforeEach(async () => {
      await createTestUser('saif@gmail.com', 'password123');
    });

    it(' Should login with valid credentials', async () => {
      const response = await loginUser('saif@gmail.com', 'password123');
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe('saif@gmail.com');
    });

    it(' Should reject invalid email', async () => {
      const response = await loginUser('wrong@gmail.com', 'password123');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });

    it(' Should reject invalid password', async () => {
      const response = await loginUser('saif@gmail.com', 'wrongpassword');
      
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid email or password');
    });
  });

  describe(' Token Verification', () => {
    let validToken;

    beforeEach(async () => {
      // Register and login to get token
      await registerUser('verify@gmail.com', 'password123');
      const loginResponse = await loginUser('verify@gmail.com', 'password123');
      validToken = loginResponse.body.accessToken;
    });

    it(' Should verify valid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      expect(response.body.message).toBe('Token is valid');
      expect(response.body.user.email).toBe('verify@gmail.com');
    });

    it(' Should reject request without token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it(' Should reject invalid token', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.error).toBe('Invalid token');
    });
  });
});