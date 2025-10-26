const express = require('express');
const db = require('../db');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(requireAuth);

/**
 * Get all tasks for the authenticated user
 * GET /tasks
 */
router.get('/', (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT id, title, description, completed, due_date, priority, created_at, updated_at 
      FROM tasks 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(req.user.userId);

    // Convert boolean values from integers
    const processedTasks = tasks.map(task => ({
      ...task,
      completed: Boolean(task.completed)
    }));

    res.json({
      tasks: processedTasks,
      count: processedTasks.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * Get a specific task by ID
 * GET /tasks/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Validate task ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Invalid task ID' 
      });
    }

    const task = db.prepare(`
      SELECT id, title, description, completed, due_date, priority, created_at, updated_at 
      FROM tasks 
      WHERE id = ? AND user_id = ?
    `).get(parseInt(id), req.user.userId);

    if (!task) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    // Convert boolean values from integers
    const processedTask = {
      ...task,
      completed: Boolean(task.completed)
    };

    res.json({ task: processedTask });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * Create a new task
 * POST /tasks
 */
router.post('/', (req, res) => {
  try {
    const { title, description, completed = false, due_date, priority = 'medium' } = req.body;

    // Validate input
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Title is required' 
      });
    }

    if (title.length > 255) {
      return res.status(400).json({ 
        error: 'Title must be less than 255 characters' 
      });
    }

    if (description && description.length > 1000) {
      return res.status(400).json({ 
        error: 'Description must be less than 1000 characters' 
      });
    }

    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ 
        error: 'Priority must be low, medium, or high' 
      });
    }

    // Insert new task
    const result = db.prepare(`
      INSERT INTO tasks (title, description, completed, due_date, priority, user_id) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      title.trim(), 
      description?.trim() || null, 
      completed ? 1 : 0, 
      due_date || null, 
      priority, 
      req.user.userId
    );

    // Get the created task
    const newTask = db.prepare(`
      SELECT id, title, description, completed, due_date, priority, created_at, updated_at 
      FROM tasks 
      WHERE id = ?
    `).get(result.lastInsertRowid);

    // Convert boolean values from integers
    const processedTask = {
      ...newTask,
      completed: Boolean(newTask.completed)
    };

    res.status(201).json({
      message: 'Task created successfully',
      task: processedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * Update a task
 * PUT /tasks/:id
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, due_date, priority } = req.body;

    // Validate task ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Invalid task ID' 
      });
    }

    // Check if task exists and belongs to user
    const existingTask = db.prepare(`
      SELECT id FROM tasks 
      WHERE id = ? AND user_id = ?
    `).get(parseInt(id), req.user.userId);

    if (!existingTask) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    // Validate input
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Title is required' 
        });
      }
      if (title.length > 255) {
        return res.status(400).json({ 
          error: 'Title must be less than 255 characters' 
        });
      }
    }

    if (description !== undefined && description && description.length > 1000) {
      return res.status(400).json({ 
        error: 'Description must be less than 1000 characters' 
      });
    }

    if (priority !== undefined && priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ 
        error: 'Priority must be low, medium, or high' 
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title.trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description?.trim() || null);
    }

    if (completed !== undefined) {
      updates.push('completed = ?');
      values.push(completed ? 1 : 0);
    }

    if (due_date !== undefined) {
      updates.push('due_date = ?');
      values.push(due_date || null);
    }

    if (priority !== undefined) {
      updates.push('priority = ?');
      values.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        error: 'No valid fields to update' 
      });
    }

    values.push(parseInt(id));

    // Update task
    const updateQuery = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(updateQuery).run(...values);

    // Get updated task
    const updatedTask = db.prepare(`
      SELECT id, title, description, completed, due_date, priority, created_at, updated_at 
      FROM tasks 
      WHERE id = ?
    `).get(parseInt(id));

    // Convert boolean values from integers
    const processedTask = {
      ...updatedTask,
      completed: Boolean(updatedTask.completed)
    };

    res.json({
      message: 'Task updated successfully',
      task: processedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

/**
 * Delete a task
 * DELETE /tasks/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    // Validate task ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        error: 'Invalid task ID' 
      });
    }

    // Check if task exists and belongs to user
    const existingTask = db.prepare(`
      SELECT id FROM tasks 
      WHERE id = ? AND user_id = ?
    `).get(parseInt(id), req.user.userId);

    if (!existingTask) {
      return res.status(404).json({ 
        error: 'Task not found' 
      });
    }

    // Delete task
    db.prepare('DELETE FROM tasks WHERE id = ?').run(parseInt(id));

    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

module.exports = router;