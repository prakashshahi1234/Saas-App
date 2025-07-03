import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAhhpUtOEWzHvsU0Erwh9OvZbKnRJiD2fU",
  authDomain: "saas-app-a064a.firebaseapp.com",
  projectId: "saas-app-a064a",
  storageBucket: "saas-app-a064a.firebasestorage.app",
  messagingSenderId: "839853490114",
  appId: "1:839853490114:web:619914720605ee0b82a05b",
  measurementId: "G-03D0H0K1D8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { analytics };
export default app; 