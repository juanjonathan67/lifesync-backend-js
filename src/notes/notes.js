const express = require('express');
const { db } = require('../middleware/firebaseAdmin');
const authenticateToken = require('../middleware/authToken');

const router = express.Router();
const notesRef = (userId) => db.ref(`users/${userId}/notes`);

// Create a new note
router.post('/', authenticateToken, (req, res) => {
  const { title, imageUri, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      error: true,
      message: 'Title and description are required'
    });
  }

  const newNoteRef = notesRef(req.user.userId).push();
  newNoteRef.set({ title, imageUri, description }, (error) => {
    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error creating note'
      });
    }
    res.status(201).json({
      error: false,
      message: 'Note created successfully',
      noteId: newNoteRef.key
    });
  });
});

// Get all notes
router.get('/', authenticateToken, (req, res) => {
    notesRef(req.user.userId).once('value', (snapshot) => {
      const notesData = snapshot.val() || {};
      const notes = Object.keys(notesData).map(noteId => ({
        noteId,
        ...notesData[noteId]
      }));
      res.json({
        error: false,
        notes
      });
    }, (error) => {
      res.status(500).json({
        error: true,
        message: 'Error fetching notes'
      });
    });
  });

// Update a note
router.put('/:noteId', authenticateToken, (req, res) => {
  const { noteId } = req.params;
  const { title, imageUri, description } = req.body;

  notesRef(req.user.userId).child(noteId).update({ title, imageUri, description }, (error) => {
    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error updating note'
      });
    }
    res.json({
      error: false,
      message: 'Note updated successfully'
    });
  });
});

// Delete a note
router.delete('/:noteId', authenticateToken, (req, res) => {
  const { noteId } = req.params;

  notesRef(req.user.userId).child(noteId).remove((error) => {
    if (error) {
      return res.status(500).json({
        error: true,
        message: 'Error deleting note'
      });
    }
    res.json({
      error: false,
      message: 'Note deleted successfully'
    });
  });
});

module.exports = router;