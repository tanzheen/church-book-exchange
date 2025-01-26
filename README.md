# Church Book Exchange

A web application for church members to catalogue and exchange books with each other.

## Features

- User authentication and registration
- Book catalogue with search and filter capabilities
- Book listing management (add, edit, delete books)
- Book exchange request system
- User profiles and history

## Tech Stack

- Frontend: React.js
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT

## Project Structure

```
church-book-exchange/
├── client/          # React frontend
└── server/          # Node.js backend
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd server
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd client
   npm start
   ```

## Environment Variables

Create `.env` files in both client and server directories with the following variables:

### Server (.env)
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

### Client (.env)
```
REACT_APP_API_URL=http://localhost:5000
```
