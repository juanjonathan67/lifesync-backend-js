const express = require('express');
const { db } = require('../middleware/firebaseAdmin');
const authenticateToken = require('../middleware/authToken');

const router = express.Router();
const tasksRef = (userId) => db.ref(`users/${userId}/tasks`);

// Create a new task
router.post('/', authenticateToken, (req, res) => {
  const { title, startDateTime, endDateTime, description, color } = req.body;

  if (!title || !startDateTime || !endDateTime) {
    return res.status(400).json({
      error: true,
      message: 'Title, start date, and end date are required'
    });
  }

  const newTaskRef = tasksRef(req.user.userId).push();
  newTaskRef.set({ title, startDateTime, endDateTime, description, color }, (error) => {
    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error creating task'
      });
    }
    res.status(201).json({
      error: false,
      message: 'Task created successfully',
      taskId: newTaskRef.key
    });
  });
});

// Get all tasks
router.get('/', authenticateToken, (req, res) => {
    tasksRef(req.user.userId).once('value', (snapshot) => {
      const tasksData = snapshot.val() || {};
      const tasks = Object.keys(tasksData).map(taskId => ({
        taskId,
        ...tasksData[taskId]
      }));
      res.json({
        error: false,
        tasks
      });
    }, (error) => {
      res.status(500).json({
        error: true,
        message: 'Error fetching tasks'
      });
    });
  });

// Update a task
router.put('/:taskId', authenticateToken, (req, res) => {
  const { taskId } = req.params;
  const { title, startDateTime, endDateTime, description, color } = req.body;

  tasksRef(req.user.userId).child(taskId).update({ title, startDateTime, endDateTime, description, color }, (error) => {
    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error updating task'
      });
    }
    res.json({
      error: false,
      message: 'Task updated successfully'
    });
  });
});

// Delete a task
router.delete('/:taskId', authenticateToken, (req, res) => {
  const { taskId } = req.params;

  tasksRef(req.user.userId).child(taskId).remove((error) => {
    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error deleting task'
      });
    }
    res.json({
      error: false,
      message: 'Task deleted successfully'
    });
  });
});

module.exports = router;