const Book = require('../models/Book');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const books = await Book.find(query)
      .populate('owner', 'name email church')
      .populate('currentHolder', 'name email church');

    res.json(books);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's books
// @route   GET /api/books/mybooks
// @access  Private
const getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ owner: req.user._id })
      .populate('owner', 'name email church')
      .populate('currentHolder', 'name email church');

    res.json(books);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('owner', 'name email church')
      .populate('currentHolder', 'name email church');

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a book
// @route   POST /api/books
// @access  Private
const createBook = async (req, res) => {
  try {
    const { title, author, description, condition, category, image } = req.body;

    const book = await Book.create({
      title,
      author,
      description,
      condition,
      category,
      image: image || 'default-book.jpg',
      owner: req.user._id,
    });

    const populatedBook = await book.populate('owner', 'name email church');
    res.status(201).json(populatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private
const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user is book owner
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true }
    ).populate('owner', 'name email church')
     .populate('currentHolder', 'name email church');

    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user is book owner
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await book.remove();
    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getBooks,
  getMyBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
}; 