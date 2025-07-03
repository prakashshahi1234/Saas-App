# Backend API

Express.js backend with MongoDB for Your App. Authentication is handled by Firebase.

## Features

- ✅ Express.js server
- ✅ MongoDB with Mongoose
- ✅ CORS enabled
- ✅ Environment configuration
- ✅ Firebase Authentication (handled on frontend)
- ✅ Error handling middleware
- ✅ Health check endpoints

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `config.env` and update with your settings
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `PORT` (default: 5000)

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Start production server:**
   ```bash
   npm start
   ```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check
- `GET /api/test` - Test endpoint

## Authentication

Authentication is handled by Firebase on the frontend. The backend will receive Firebase ID tokens for protected routes.

## Database

MongoDB with Mongoose ODM. Models and schemas will be added as needed.

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/saas-app
```

## Project Structure

```
backend/
├── server.js          # Main server file
├── config.env         # Environment variables
├── package.json       # Dependencies and scripts
├── routes/            # API routes
├── models/            # MongoDB models
├── controllers/       # Route controllers
├── services/          # Business logic services
└── middleware/        # Custom middleware
``` 