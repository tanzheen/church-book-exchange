import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          textAlign: "center",
          gap: 3,
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to the Church Book Exchange
        </Typography>

        <Typography variant="h5" color="text.secondary" gutterBottom>
          Share and discover books with your churchmates.
        </Typography>

        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button
            component={Link}
            to="/books"
            variant="contained"
            size="large"
            sx={{
              backgroundColor: "#1a1a2e",
              "&:hover": {
                backgroundColor: "#2a2a3e",
              },
            }}
          >
            Browse Books
          </Button>

          <Button component={Link} to="/login" variant="outlined" size="large">
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
