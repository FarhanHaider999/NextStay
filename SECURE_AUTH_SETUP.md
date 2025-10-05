# NextStay Secure Server-Side Authentication Setup

## 🔒 **SECURE SERVER-SIDE AUTHENTICATION SYSTEM**

This implementation provides enterprise-grade security with all authentication logic handled on the server side, keeping sensitive operations away from the client.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    HTTP/HTTPS     ┌──────────────────┐
│   Next.js       │◄─────────────────►│   Express.js     │
│   Client        │   API Calls       │   Server         │
│                 │                   │                  │
│ - UI Components │                   │ - Auth Logic     │
│ - Auth Context  │                   │ - JWT Tokens     │
│ - State Mgmt    │                   │ - Password Hash  │
└─────────────────┘                   │ - Email Service  │
                                      │ - MongoDB        │
                                      └──────────────────┘
```

## ✅ **Security Features Implemented**

### **Server-Side Security:**
- 🔐 **Password Hashing**: bcrypt with salt rounds (12)
- 🎫 **JWT Tokens**: Secure token generation and verification
- 🛡️ **Authentication Middleware**: Protected route access
- 📧 **Email Verification**: Secure token-based verification
- 🔄 **Password Reset**: Time-limited reset tokens
- 🚫 **Rate Limiting Ready**: Prepared for production rate limiting
- 🍪 **Secure Headers**: Helmet.js security headers
- 🔒 **CORS Protection**: Configured for specific origins

### **Client-Side Security:**
- 🔑 **Token Storage**: Secure localStorage with automatic cleanup
- 🚪 **Auto Logout**: Token expiration handling
- 🛡️ **Route Protection**: Automatic redirects for unauthenticated users
- 🔄 **Session Management**: Real-time session state updates

## 📁 **File Structure**

### **Server (Express.js + MongoDB):**
```
server/
├── src/
│   ├── models/
│   │   └── User.ts              # User schema with validation
│   ├── routes/
│   │   └── auth.ts              # Authentication endpoints
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication middleware
│   ├── utils/
│   │   ├── jwt.ts               # JWT token management
│   │   └── email.ts             # Email service (Gmail SMTP)
│   ├── config/
│   │   └── db.ts                # MongoDB connection
│   └── index.ts                 # Express server setup
├── .env                         # Server environment variables
└── package.json                 # Server dependencies
```

### **Client (Next.js):**
```
client/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx      # Authentication context
│   ├── components/
│   │   ├── UserMenu.tsx         # User dropdown menu
│   │   └── Navbar.tsx           # Navigation bar
│   ├── app/
│   │   ├── auth/
│   │   │   ├── signin/page.tsx  # Sign-in page
│   │   │   ├── signup/page.tsx  # Sign-up page
│   │   │   └── verify-request/page.tsx
│   │   ├── dashboard/page.tsx   # Protected dashboard
│   │   └── page.tsx             # Home page with redirects
│   └── .env.local               # Client environment variables
```

## 🚀 **Setup Instructions**

### **1. Server Setup**

#### **Environment Configuration:**
Create `server/.env` with:
```env
# Server Configuration
PORT=5000
MONGO_URL=mongodb://localhost:27017/nextstay
JWT_SECRET=your-super-secure-jwt-secret-change-this-in-production
JWT_EXPIRES_IN=7d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=your-gmail@gmail.com

# CORS Configuration
CLIENT_URL=http://localhost:3000

# Optional: Admin Configuration
ADMIN_EMAIL=admin@nextstay.com
```

#### **Install Dependencies:**
```bash
cd server
npm install
```

#### **Start Server:**
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### **2. Client Setup**

#### **Environment Configuration:**
Create `client/.env.local` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### **Install Dependencies:**
```bash
cd client
npm install
```

#### **Start Client:**
```bash
npm run dev
```

### **3. Database Setup**

#### **MongoDB Installation:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# Follow MongoDB installation guide for your OS
```

#### **Database Connection:**
The server will automatically connect to MongoDB using the `MONGO_URL` from environment variables.

## 📡 **API Endpoints**

### **Authentication Routes (`/api/auth/`)**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | User registration | No |
| POST | `/login` | User login | No |
| POST | `/logout` | User logout | Yes |
| GET | `/me` | Get user profile | Yes |
| PUT | `/me` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| POST | `/verify-email` | Verify email address | No |
| POST | `/resend-verification` | Resend verification email | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password | No |

### **Request/Response Examples:**

#### **Register User:**
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerified": false
    },
    "token": "jwt_token_here"
  }
}
```

#### **Login User:**
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "emailVerified": true,
      "avatar": null
    },
    "token": "jwt_token_here"
  }
}
```

## 🔧 **Usage Examples**

### **Client-Side Authentication:**

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // User is now logged in
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    // User is now logged out
  };

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### **Server-Side Route Protection:**

```typescript
import { authenticate } from '../middleware/auth';

// Protect a route
router.get('/protected', authenticate, (req, res) => {
  // req.user contains the authenticated user
  res.json({
    success: true,
    data: req.user
  });
});
```

## 🛡️ **Security Best Practices**

### **Production Checklist:**

1. **Environment Variables:**
   - [ ] Change `JWT_SECRET` to a secure random string
   - [ ] Use environment-specific database URLs
   - [ ] Set up proper email service credentials

2. **Database Security:**
   - [ ] Enable MongoDB authentication
   - [ ] Use connection string with credentials
   - [ ] Enable SSL/TLS for database connections

3. **Server Security:**
   - [ ] Use HTTPS in production
   - [ ] Set up rate limiting
   - [ ] Enable CORS for specific domains only
   - [ ] Use helmet.js security headers

4. **Email Security:**
   - [ ] Use app-specific passwords for Gmail
   - [ ] Consider using professional email services (SendGrid, AWS SES)
   - [ ] Implement email rate limiting

## 🧪 **Testing the System**

### **1. Start Both Servers:**
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client  
cd client
npm run dev
```

### **2. Test Authentication Flow:**
1. Visit `http://localhost:3000`
2. Click "Sign Up" to create an account
3. Check your email for verification link
4. Sign in with your credentials
5. Access the protected dashboard
6. Test logout functionality

### **3. API Testing with curl:**
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Access protected route
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify database permissions

2. **Email Not Sending:**
   - Check Gmail app password
   - Verify SMTP settings
   - Check spam folder

3. **JWT Token Issues:**
   - Ensure `JWT_SECRET` is set
   - Check token expiration
   - Verify token format in requests

4. **CORS Errors:**
   - Check `CLIENT_URL` in server `.env`
   - Verify client is running on correct port
   - Check CORS configuration in server

## 🔄 **Next Steps**

1. **Add Google OAuth** (optional):
   - Set up Google Cloud Console
   - Add OAuth provider to server
   - Update client login flow

2. **Implement Rate Limiting:**
   - Add express-rate-limit
   - Configure limits for auth endpoints
   - Add IP-based blocking

3. **Add User Roles:**
   - Extend User model with roles
   - Add role-based middleware
   - Implement admin dashboard

4. **Enhanced Security:**
   - Add 2FA support
   - Implement session management
   - Add audit logging

The authentication system is now fully functional with enterprise-grade security! 🎉
