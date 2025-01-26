import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  CardActions,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const BookCard = ({ book, onExchange, showActions = true }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleViewDetails = () => {
    navigate(`/books/${book._id}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Reserved':
        return 'warning';
      case 'Exchanged':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={book.image || '/default-book.jpg'}
        alt={book.title}
        sx={{ objectFit: 'contain', p: 2 }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          by {book.author}
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Chip
            label={book.category}
            size="small"
            sx={{ mr: 1, mb: 1 }}
          />
          <Chip
            label={book.status}
            color={getStatusColor(book.status)}
            size="small"
            sx={{ mb: 1 }}
          />
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {book.description}
        </Typography>
      </CardContent>
      {showActions && (
        <CardActions>
          <Button size="small" onClick={handleViewDetails}>
            View Details
          </Button>
          {user && book.status === 'Available' && book.owner._id !== user._id && (
            <Button
              size="small"
              color="primary"
              onClick={() => onExchange(book)}
            >
              Request Exchange
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default BookCard; 