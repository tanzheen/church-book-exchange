import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import useAuth from "./hooks/useAuth";
import "./App.css";
import Books from "./pages/Books";
import supabase from "./config/supabaseClient";

// Lazy load pages
const Home = React.lazy(() => import("./pages/Home"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const BookDetails = React.lazy(() => import("./pages/BookDetails"));
const Profile = React.lazy(() => import("./pages/Profile"));
const MyBooks = React.lazy(() => import("./pages/MyBooks"));
const Exchanges = React.lazy(() => import("./pages/Exchanges"));

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1a1a2e",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    h2: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 400,
    },
  },
});

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const App = () => {
  // Example function to test Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from("books") // replace 'books' with your table name
        .select("*");

      if (error) throw error;
      console.log("Data:", data);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Layout>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/books" element={<Books />} />
                <Route path="/books/:id" element={<BookDetails />} />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-books"
                  element={
                    <ProtectedRoute>
                      <MyBooks />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/exchanges"
                  element={
                    <ProtectedRoute>
                      <Exchanges />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </React.Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
