import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { exchanges } from '../utils/api';

const STATUS_COLORS = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error',
  completed: 'info',
};

const Exchanges = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchExchanges();
  }, []);

  const fetchExchanges = async () => {
    try {
      const [incomingData, outgoingData] = await Promise.all([
        exchanges.getIncoming(),
        exchanges.getOutgoing(),
      ]);
      setIncomingRequests(incomingData.data);
      setOutgoingRequests(outgoingData.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching exchanges:', error);
      setError('Failed to load exchange requests');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (exchange, action) => {
    setSelectedExchange({ ...exchange, action });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedExchange(null);
    setResponseMessage('');
  };

  const handleAction = async () => {
    if (!selectedExchange) return;

    setActionLoading(true);
    try {
      const { action } = selectedExchange;
      if (action === 'accept') {
        await exchanges.accept(selectedExchange._id, { message: responseMessage });
      } else if (action === 'reject') {
        await exchanges.reject(selectedExchange._id, { message: responseMessage });
      } else if (action === 'complete') {
        await exchanges.complete(selectedExchange._id);
      } else if (action === 'cancel') {
        await exchanges.cancel(selectedExchange._id);
      }
      handleCloseDialog();
      fetchExchanges();
    } catch (error) {
      console.error('Error performing action:', error);
      setError('Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const renderExchangeCard = (exchange, isIncoming = false) => (
    <Paper sx={{ p: 3, mb: 2 }} elevation={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8}>
          <Typography variant="h6">
            {isIncoming ? exchange.requesterBook.title : exchange.ownerBook.title}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            {isIncoming
              ? `Requested by: ${exchange.requester.name}`
              : `Owner: ${exchange.owner.name}`}
          </Typography>
          <Typography variant="body2" paragraph>
            Message: {exchange.message || 'No message provided'}
          </Typography>
          {exchange.responseMessage && (
            <Typography variant="body2" color="text.secondary">
              Response: {exchange.responseMessage}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={4} sx={{ textAlign: 'right' }}>
          <Chip
            label={exchange.status.toUpperCase()}
            color={STATUS_COLORS[exchange.status]}
            sx={{ mb: 2 }}
          />
          <Box>
            <Button
              size="small"
              onClick={() => navigate(`/books/${isIncoming ? exchange.requesterBook._id : exchange.ownerBook._id}`)}
              sx={{ mr: 1 }}
            >
              View Book
            </Button>
            {isIncoming && exchange.status === 'pending' && (
              <>
                <Button
                  size="small"
                  color="success"
                  onClick={() => handleOpenDialog(exchange, 'accept')}
                  sx={{ mr: 1 }}
                >
                  Accept
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleOpenDialog(exchange, 'reject')}
                >
                  Reject
                </Button>
              </>
            )}
            {exchange.status === 'accepted' && (
              <Button
                size="small"
                color="primary"
                onClick={() => handleOpenDialog(exchange, 'complete')}
              >
                Mark Complete
              </Button>
            )}
            {exchange.status === 'pending' && !isIncoming && (
              <Button
                size="small"
                color="error"
                onClick={() => handleOpenDialog(exchange, 'cancel')}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 4 }}>
        Book Exchanges
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label={`Incoming (${incomingRequests.length})`} />
          <Tab label={`Outgoing (${outgoingRequests.length})`} />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <div>
          {incomingRequests.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No incoming exchange requests
            </Typography>
          ) : (
            incomingRequests.map((exchange) => renderExchangeCard(exchange, true))
          )}
        </div>
      )}

      {activeTab === 1 && (
        <div>
          {outgoingRequests.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No outgoing exchange requests
            </Typography>
          ) : (
            outgoingRequests.map((exchange) => renderExchangeCard(exchange))
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedExchange?.action === 'accept'
            ? 'Accept Exchange Request'
            : selectedExchange?.action === 'reject'
            ? 'Reject Exchange Request'
            : selectedExchange?.action === 'complete'
            ? 'Complete Exchange'
            : 'Cancel Exchange Request'}
        </DialogTitle>
        <DialogContent>
          {(selectedExchange?.action === 'accept' || selectedExchange?.action === 'reject') && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Response Message (Optional)"
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
          {selectedExchange?.action === 'complete' && (
            <Typography sx={{ mt: 2 }}>
              Are you sure you want to mark this exchange as complete?
            </Typography>
          )}
          {selectedExchange?.action === 'cancel' && (
            <Typography sx={{ mt: 2 }}>
              Are you sure you want to cancel this exchange request?
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAction}
            variant="contained"
            color={selectedExchange?.action === 'reject' ? 'error' : 'primary'}
            disabled={actionLoading}
          >
            {actionLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Exchanges; 