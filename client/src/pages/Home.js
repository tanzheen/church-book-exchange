import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { books } from '../utils/api';
import BookCard from '../components/BookCard';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedBooks = async () => {
      try {
        const { data } = await books.getAll({ status: 'Available', limit: 6 });
        setFeaturedBooks(data);
      } catch (error) {
        console.error('Error fetching featured books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBooks();
  }, []);

  const handleExchange = (book) => {
    if (!user) {
      navigate('/login');
    } else {
      navigate(`/books/${book._id}`);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(/books-background.jpg)',
          p: 6,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: 'relative',
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
              }}
            >
              <Typography
                component="h1"
                variant="h3"
                color="inherit"
                gutterBottom
              >
                Welcome to Church Book Exchange
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                Share and discover books within your church community. Join us in
                spreading knowledge and faith through literature.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/books')}
              >
                Browse Books
              </Button>
              {!user && (
                <Button
                  variant="outlined"
                  size="large"
                  sx={{ ml: 2, color: '#fff', borderColor: '#fff' }}
                  onClick={() => navigate('/register')}
                >
                  Join Now
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Featured Books Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Featured Books
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={4}>
            {featuredBooks.map((book) => (
              <Grid item key={book._id} xs={12} sm={6} md={4}>
                <BookCard book={book} onExchange={handleExchange} />
              </Grid>
            ))}
          </Grid>
        )}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/books')}
          >
            View All Books
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home; 