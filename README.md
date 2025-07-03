# SaaS Project Management Platform

A full-stack SaaS application for project management with integrated payment processing, user authentication, and analytics. Built with modern technologies and best practices.

## 🚀 Features

### 🔐 Authentication & User Management
- **Firebase Authentication** with email/password and email verification
- Protected routes and user session management
- User profile management with account status tracking
- Password reset functionality

### 💰 Payment Integration
- **Stripe Payment Processing** for secure transactions
- Pay-per-project model (₹100 per project creation)
- Real-time balance management
- Transaction history and payment analytics
- Automatic balance deduction for project creation

### 📊 Project Management
- **Complete CRUD operations** for projects
- Project status tracking (Planning, In Progress, Completed, On Hold)
- Progress monitoring with percentage tracking
- Budget management and cost tracking
- Team member assignment
- Project tags and categorization
- Search and filtering capabilities

### 📈 Analytics Dashboard
- Project statistics and metrics
- Payment analytics and transaction history
- User activity tracking
- Balance overview and spending patterns
- Real-time data visualization

### 🎯 Additional Features
- **Free Quote API Integration** for inspirational quotes
- Responsive design with modern UI/UX
- Real-time data updates
- Error handling and user feedback
- Loading states and optimistic updates

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **MobX State Tree** - State management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Stripe React** - Payment processing
- **Firebase** - Authentication and user management
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend
- **Node.js** with **Express.js**
- **TypeScript** - Type-safe backend development
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Stripe** - Payment processing API
- **JWT** - Token-based authentication
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

### DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **MongoDB** - Database container
- **Health checks** - Service monitoring
- **Environment variables** - Secure configuration

## 📁 Project Structure

```
saas-app/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages
│   │   ├── components/          # Reusable UI components
│   │   ├── models/             # MobX State Tree models
│   │   ├── lib/                # Utilities and configurations
│   │   ├── hooks/              # Custom React hooks
│   │   └── Dockerfile          # Frontend container
│   ├── backend/                # Express.js backend API
│   │   ├── src/
│   │   │   ├── controllers/    # Route controllers
│   │   │   ├── models/         # Mongoose models
│   │   │   ├── routes/         # API routes
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Custom middleware
│   │   │   └── config/         # Configuration files
│   │   └── Dockerfile          # Backend container
│   ├── docker-compose.yml      # Multi-container setup
│   └── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (handled by Docker)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd saas-app
```

### 2. Environment Setup
The application uses environment variables configured in `docker-compose.yml`:

```yaml
# Frontend Environment Variables
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_API_URL=http://localhost:5000

# Backend Environment Variables
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
MONGODB_URI=mongodb://mongodb:27017/saas-app
```

### 3. Start the Application
```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017

## 🔧 Development Setup

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Database Setup
MongoDB is automatically configured via Docker Compose with persistent storage.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification

### Project Endpoints
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/stats` - Get project statistics

### Payment Endpoints
- `GET /api/payments/balance` - Get user balance
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `GET /api/payments/transactions` - Get transaction history
- `POST /api/payments/webhook` - Stripe webhook handler

### Quote Endpoints
- `GET /api/quotes/random` - Get random inspirational quote

## 💳 Payment Flow

1. **User Registration**: Users sign up with Firebase authentication
2. **Balance Check**: System checks if user has sufficient balance (₹100 per project)
3. **Payment Processing**: Users can top up their balance via Stripe
4. **Project Creation**: Balance is automatically deducted when creating projects
5. **Transaction Tracking**: All payments and deductions are logged

## 🔒 Security Features

- **Firebase Authentication** for secure user management
- **JWT tokens** for API authentication
- **CORS protection** for cross-origin requests
- **Input validation** with Zod schemas
- **Environment variable** protection
- **Docker security** best practices

## 📊 Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  email: String,
  firebaseUid: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  description: String,
  status: String,
  progress: Number,
  budget: Number,
  tags: [String],
  teamMembers: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### UserBalance Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  balance: Number,
  currency: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String, // 'credit' | 'debit'
  amount: Number,
  currency: String,
  description: String,
  reference: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

The application includes comprehensive error handling and validation:

- **Frontend**: Form validation with Zod schemas
- **Backend**: Input validation and error middleware
- **API**: Proper HTTP status codes and error responses
- **Database**: Data integrity with Mongoose schemas

## 🚀 Deployment

### Production Deployment
1. Update environment variables for production
2. Build Docker images: `docker compose build`
3. Deploy to your preferred cloud platform
4. Set up SSL certificates and domain configuration

### Environment Variables for Production
```bash
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MONGODB_URI=mongodb://production-db-url
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Fullstack Engineer Assignment**
- **Technologies**: Next.js, Node.js, TypeScript, MongoDB, Stripe, Firebase
- **Architecture**: Microservices with Docker containerization
- **Features**: Complete SaaS platform with payment processing
- **Best Practices**: Modern development practices and security standards

---

**This project demonstrates proficiency in:**
- Full-stack development with modern frameworks
- Payment processing and financial integrations
- User authentication and authorization
- Database design and management
- API development and documentation
- Containerization and DevOps practices
- Security implementation and best practices
- Real-time data handling and state management
