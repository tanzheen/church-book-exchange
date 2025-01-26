import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { books } from '../utils/api';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [exchangeMessage, setExchangeMessage] = useState('');
  const [exchangeLoading, setExchangeLoading] = useState(false);

  useEffect(() => {
    fetchBookDetails();
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      const { data } = await books.getById(id);
      setBook(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching book details:', error);
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeRequest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setExchangeDialogOpen(true);
  };

  const handleExchangeSubmit = async () => {
    if (!exchangeMessage.trim()) return;

    setExchangeLoading(true);
    try {
      await books.exchanges.create({
        bookId: book._id,
        requestMessage: exchangeMessage,
      });
      setExchangeDialogOpen(false);
      setExchangeMessage('');
      fetchBookDetails(); // Refresh book details
    } catch (error) {
      console.error('Error requesting exchange:', error);
      setError('Failed to send exchange request');
    } finally {
      setExchangeLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !book) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error || 'Book not found'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={4}>
          {/* Book Image */}
          <Grid item xs={12} md={4}>
            <Box
              component="img"
              src={book.image || '/default-book.jpg'}
              alt={book.title}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: 400,
                objectFit: 'contain',
              }}
            />
          </Grid>

          {/* Book Details */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              by {book.author}
            </Typography>

            <Box sx={{ my: 2 }}>
              <Chip
                label={book.category}
                sx={{ mr: 1 }}
              />
              <Chip
                label={book.status}
                color={
                  book.status === 'Available'
                    ? 'success'
                    : book.status === 'Reserved'
                    ? 'warning'
                    : 'error'
                }
              />
              <Chip
                label={`Condition: ${book.condition}`}
                sx={{ ml: 1 }}
              />
            </Box>

            <Typography variant="body1" paragraph>
              {book.description}
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Owner: {book.owner.name}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Church: {book.owner.church}
              </Typography>
            </Box>

            {user && book.owner._id !== user._id && book.status === 'Available' && (
              <Button
                variant="contained"
                size="large"
                onClick={handleExchangeRequest}
                sx={{ mt: 2 }}
              >
                Request Exchange
              </Button>
            )}

            {user && book.owner._id === user._id && (
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/books/edit/${book._id}`)}
                  sx={{ mr: 2 }}
                >
                  Edit Book
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    // Handle delete
                  }}
                >
                  Delete Book
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>

      {/* Exchange Request Dialog */}
      <Dialog
        open={exchangeDialogOpen}
        onClose={() => setExchangeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Request Book Exchange</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Message to book owner"
            fullWidth
            multiline
            rows={4}
            value={exchangeMessage}
            onChange={(e) => setExchangeMessage(e.target.value)}
            placeholder="Introduce yourself and explain why you'd like to borrow this book"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExchangeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleExchangeSubmit}
            variant="contained"
            disabled={exchangeLoading || !exchangeMessage.trim()}
          >
            {exchangeLoading ? 'Sending Request...' : 'Send Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookDetails; 