const express = require('express');
const router = express.Router();
const {
  getBooks,
  getMyBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getBooks);
router.get('/:id', getBookById);

// Protected routes
router.get('/user/mybooks', protect, getMyBooks);
router.post('/', protect, createBook);
router.put('/:id', protect, updateBook);
router.delete('/:id', protect, deleteBook);

module.exports = router; 