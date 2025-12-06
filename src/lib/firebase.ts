'use client';

import {initializeApp, getApps, getApp, type FirebaseApp} from 'firebase/app';
import {GoogleAuthProvider} from 'firebase/auth';
import {
  initializeAppCheck,
  ReCaptchaV3Provider,
  AppCheck,
} from 'firebase/app-check';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Basic validation to ensure Firebase config is loaded
if (
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.startsWith('YOUR_')
) {
  console.error('Firebase configuration is missing or incomplete. Please check your .env file.');
}

// Initialize Firebase
const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApp();

// Initialize App Check
let appCheckInstance: AppCheck | undefined;

if (typeof window !== 'undefined') {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
  const isDev = process.env.NODE_ENV === 'development';
  
  // Only initialize App Check if a valid reCAPTCHA key is provided
  // In development, App Check is optional - skip if key causes errors
  if (recaptchaKey && recaptchaKey.length > 10 && !recaptchaKey.startsWith('your_')) {
    try {
      appCheckInstance = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: !isDev, // Disable auto-refresh in dev to reduce errors
      });
    } catch (e) {
      if (!isDev) {
        console.warn('Failed to initialize App Check:', e);
      }
    }
  }
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export {app, googleProvider, appCheckInstance};
