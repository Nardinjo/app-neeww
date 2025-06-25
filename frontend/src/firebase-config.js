import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6ng6OM6BCp_nSITIOTBmTXlNLhVj7YHI",
  authDomain: "app-sta-8ed51.firebaseapp.com",
  projectId: "app-sta-8ed51",
  storageBucket: "app-sta-8ed51.firebasestorage.app",
  messagingSenderId: "669527116856",
  appId: "1:669527116856:web:2b90ab4ac5b529243c2acd",
  measurementId: "G-H3YVQR4KMB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Network control for offline support
export { enableNetwork, disableNetwork };

export default app;