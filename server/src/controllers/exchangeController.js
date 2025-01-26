const Exchange = require('../models/Exchange');
const Book = require('../models/Book');

// @desc    Create exchange request
// @route   POST /api/exchanges
// @access  Private
const createExchange = async (req, res) => {
  try {
    const { bookId, requestMessage } = req.body;

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.status !== 'Available') {
      return res.status(400).json({ message: 'Book is not available for exchange' });
    }

    // Create exchange request
    const exchange = await Exchange.create({
      book: bookId,
      requestedBy: req.user._id,
      owner: book.owner,
      requestMessage,
    });

    // Update book status
    book.status = 'Reserved';
    await book.save();

    const populatedExchange = await exchange
      .populate('book')
      .populate('requestedBy', 'name email church')
      .populate('owner', 'name email church');

    res.status(201).json(populatedExchange);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's exchange requests (both sent and received)
// @route   GET /api/exchanges
// @access  Private
const getMyExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.find({
      $or: [{ requestedBy: req.user._id }, { owner: req.user._id }],
    })
      .populate('book')
      .populate('requestedBy', 'name email church')
      .populate('owner', 'name email church')
      .sort('-createdAt');

    res.json(exchanges);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update exchange status
// @route   PUT /api/exchanges/:id
// @access  Private
const updateExchangeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange request not found' });
    }

    // Check if user is the book owner
    if (exchange.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update exchange status
    exchange.status = status;

    // Update book status and holder based on exchange status
    const book = await Book.findById(exchange.book);

    if (status === 'Accepted') {
      exchange.exchangeDate = Date.now();
      book.status = 'Exchanged';
      book.currentHolder = exchange.requestedBy;
    } else if (status === 'Rejected' || status === 'Cancelled') {
      book.status = 'Available';
      book.currentHolder = null;
    } else if (status === 'Completed') {
      book.status = 'Available';
      book.currentHolder = null;
      exchange.returnDate = Date.now();
    }

    await book.save();
    await exchange.save();

    const updatedExchange = await Exchange.findById(exchange._id)
      .populate('book')
      .populate('requestedBy', 'name email church')
      .populate('owner', 'name email church');

    res.json(updatedExchange);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createExchange,
  getMyExchanges,
  updateExchangeStatus,
}; 