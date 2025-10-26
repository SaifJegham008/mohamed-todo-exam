const request = require('supertest');
const app = require('../app');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe(' Tasks Tests', () => {
  let authToken, userId, otherUserToken, otherUserId;

  // Helper function to create test user
  const createTestUser = async (email, password) => {
    const hashedPassword = await bcrypt.hash(password, 12);
    return db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashedPassword);
  };

  // Helper function to create JWT token
  const createToken = (userId, email) => {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '15m' }
    );
  };

  // Helper function to create test task
  const createTestTask = (title, description, userId) => {
    return db.prepare('INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)').run(title, description, userId);
  };

  // Clean up database before each test
  beforeEach(() => {
    db.prepare('DELETE FROM tasks').run();
    db.prepare('DELETE FROM users').run();
  });

  // Setup test users and tokens
  beforeEach(async () => {
    const userResult = await createTestUser('saif@gmail.com', 'password123');
    userId = userResult.lastInsertRowid;
    
    const otherUserResult = await createTestUser('mohamed@gmail.com', 'password456');
    otherUserId = otherUserResult.lastInsertRowid;
    
    authToken = createToken(userId, 'saif@gmail.com');
    otherUserToken = createToken(otherUserId, 'mohamed@gmail.com');
  });

  describe(' GET /tasks - List Tasks', () => {
    it(' Should get all tasks for authenticated user', async () => {
      createTestTask('Task 1', 'Description 1', userId);
      createTestTask('Task 2', 'Description 2', userId);

      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(2);
      expect(response.body.count).toBe(2);
    });

    it(' Should return empty array when no tasks', async () => {
      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(0);
    });

    it(' Should not show other users tasks', async () => {
      createTestTask('Other Task', 'Other Description', otherUserId);

      const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(0);
    });

    it(' Should require authentication', async () => {
      const response = await request(app)
        .get('/tasks')
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });
  });

  describe(' GET /tasks/:id - Get Single Task', () => {
    let taskId;

    beforeEach(() => {
      const result = createTestTask('Test Task', 'Test Description', userId);
      taskId = result.lastInsertRowid;
    });

    it(' Should get specific task by ID', async () => {
      const response = await request(app)
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.task.id).toBe(taskId);
      expect(response.body.task.title).toBe('Test Task');
    });

    it(' Should return 404 for non-existent task', async () => {
      const response = await request(app)
        .get('/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it(' Should not access other users tasks', async () => {
      const otherTaskResult = createTestTask('Other Task', 'Other Description', otherUserId);
      const otherTaskId = otherTaskResult.lastInsertRowid;

      const response = await request(app)
        .get(`/tasks/${otherTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });

  describe(' POST /tasks - Create Task', () => {
    it(' Should create new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
        completed: false
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.task.title).toBe(taskData.title);
      expect(response.body.task.completed).toBe(false);
    });

    it(' Should create task with minimal data', async () => {
      const taskData = { title: 'Minimal Task' };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.task.title).toBe(taskData.title);
      expect(response.body.task.description).toBeNull();
    });

    it(' Should reject task without title', async () => {
      const taskData = { description: 'No title' };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBe('Title is required');
    });

    it(' Should reject empty title', async () => {
      const taskData = { title: '   ' };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBe('Title is required');
    });
  });

  describe('✏️ PUT /tasks/:id - Update Task', () => {
    let taskId;

    beforeEach(() => {
      const result = createTestTask('Original Task', 'Original Description', userId);
      taskId = result.lastInsertRowid;
    });

    it(' Should update task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        description: 'Updated Description',
        completed: true
      };

      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Task updated successfully');
      expect(response.body.task.title).toBe(updateData.title);
      expect(response.body.task.completed).toBe(true);
    });

    it(' Should update only provided fields', async () => {
      const updateData = { completed: true };

      const response = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.task.title).toBe('Original Task');
      expect(response.body.task.completed).toBe(true);
    });

    it(' Should return 404 for non-existent task', async () => {
      const updateData = { title: 'Updated Task' };

      const response = await request(app)
        .put('/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it(' Should not update other users tasks', async () => {
      const otherTaskResult = createTestTask('Other Task', 'Other Description', otherUserId);
      const otherTaskId = otherTaskResult.lastInsertRowid;

      const updateData = { title: 'Updated Task' };

      const response = await request(app)
        .put(`/tasks/${otherTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });

  describe(' DELETE /tasks/:id - Delete Task', () => {
    let taskId;

    beforeEach(() => {
      const result = createTestTask('Task to Delete', 'Description', userId);
      taskId = result.lastInsertRowid;
    });

    it(' Should delete task successfully', async () => {
      const response = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task was deleted
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
      expect(task).toBeUndefined();
    });

    it(' Should return 404 for non-existent task', async () => {
      const response = await request(app)
        .delete('/tasks/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });

    it(' Should not delete other users tasks', async () => {
      const otherTaskResult = createTestTask('Other Task', 'Other Description', otherUserId);
      const otherTaskId = otherTaskResult.lastInsertRowid;

      const response = await request(app)
        .delete(`/tasks/${otherTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Task not found');
    });
  });

  describe('⭐ Task Features - Priority & Due Date', () => {
    it(' Should create task with priority', async () => {
      const taskData = {
        title: 'High Priority Task',
        priority: 'high'
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.task.priority).toBe('high');
    });

    it(' Should create task with due date', async () => {
      const taskData = {
        title: 'Task with Due Date',
        due_date: '2024-12-31'
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.task.due_date).toBe('2024-12-31');
    });

    it(' Should reject invalid priority', async () => {
      const taskData = {
        title: 'Task with Invalid Priority',
        priority: 'invalid'
      };

      const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body.error).toBe('Priority must be low, medium, or high');
    });
  });
});