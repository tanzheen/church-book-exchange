import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography,
  CircularProgress,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { books } from "../utils/api";
import { useAuth } from "../hooks/useAuth";
import BookCard from "../components/BookCard";
import supabase from "../config/supabaseClient";

const ITEMS_PER_PAGE = 9;
const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Christian Living",
  "Bible Study",
  "Biography",
  "Children",
  "Other",
];

const Books = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booksList, setBooksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "Available",
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [exchangeDialogOpen, setExchangeDialogOpen] = useState(false);
  const [exchangeMessage, setExchangeMessage] = useState("");
  const [exchangeLoading, setExchangeLoading] = useState(false);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data, error } = await supabase
          .from("books") // replace 'books' with your table name
          .select("*");

        if (error) throw error;
        setBooks(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const handleExchange = (book) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedBook(book);
    setExchangeDialogOpen(true);
  };

  const handleExchangeSubmit = async () => {
    if (!selectedBook || !exchangeMessage.trim()) return;

    setExchangeLoading(true);
    try {
      await books.exchanges.create({
        bookId: selectedBook._id,
        requestMessage: exchangeMessage,
      });
      setExchangeDialogOpen(false);
      setExchangeMessage("");
      fetchBooks(); // Refresh the books list
    } catch (error) {
      console.error("Error requesting exchange:", error);
    } finally {
      setExchangeLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Browse Books
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search books"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by title or author"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                label="Category"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={filters.status}
                label="Status"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Reserved">Reserved</MenuItem>
                <MenuItem value="Exchanged">Exchanged</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Books Grid */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {booksList.map((book) => (
              <Grid item key={book._id} xs={12} sm={6} md={4}>
                <BookCard book={book} onExchange={handleExchange} />
              </Grid>
            ))}
          </Grid>

          {/* No Results */}
          {booksList.length === 0 && (
            <Box sx={{ textAlign: "center", my: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No books found matching your criteria
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

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
            {exchangeLoading ? "Sending Request..." : "Send Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Books;
