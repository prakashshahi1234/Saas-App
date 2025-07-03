# Firebase Setup Instructions

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name and follow the setup wizard
4. Enable Google Analytics (optional)

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication
5. **Enable "Email link (passwordless sign-in)" if you want passwordless authentication**
6. Click "Save"

## 3. Configure Email Templates

1. In Firebase Console, go to **Authentication** → **Templates**
2. Customize the following email templates:
   - **Email verification**: Customize the verification email template
   - **Password reset**: Customize the password reset email template
3. You can customize:
   - Email subject
   - Email content
   - Action button text
   - Your app name and logo

## 4. Get Your Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname
6. Copy the configuration object

## 5. Set Up Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Replace the values with your actual Firebase configuration.

## 6. Start the Development Server

```bash
npm run dev
```

## 7. Test the Authentication

1. Visit `http://localhost:3000`
2. You'll be redirected to the authentication page
3. Create a new account or sign in with existing credentials
4. You'll be redirected to the dashboard upon successful authentication

## Features Included

- ✅ Email/Password authentication
- ✅ Email verification
- ✅ Password reset functionality
- ✅ Form validation with Zod
- ✅ React Hook Form integration
- ✅ shadcn/ui components
- ✅ Protected routes
- ✅ Loading states
- ✅ Toast notifications
- ✅ Responsive design
- ✅ TypeScript support

## Available Routes

- `/` - Redirects to `/auth` or `/dashboard` based on auth status
- `/auth` - Authentication page (sign in/sign up)
- `/verify-email` - Email verification page
- `/dashboard` - Protected dashboard page

## Email Verification Flow

1. User signs up with email and password
2. Verification email is automatically sent
3. User is redirected to `/verify-email` page
4. User clicks verification link in email
5. User returns to app and clicks "I've Verified My Email"
6. User is redirected to dashboard with verified status

## Password Reset Flow

1. User clicks "Forgot your password?" on sign-in page
2. User enters email address
3. Reset email is sent to user
4. User clicks reset link in email
5. User sets new password
6. User can sign in with new password 