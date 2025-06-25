import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
          setUser(firebaseUser);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, { displayName: username });
      
      // Create user document in Firestore
      const userData = {
        uid: user.uid,
        email: user.email,
        username: username,
        isApproved: email === 'leonard.lamaj@gmail.com', // Auto-approve admin
        isAdmin: email === 'leonard.lamaj@gmail.com',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        language: 'en'
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      setUserProfile(userData);
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user profile to check approval status
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data();
      if (!userData.isApproved && email !== 'leonard.lamaj@gmail.com') {
        await signOut(auth);
        throw new Error('Account pending approval');
      }
      
      // Update last login
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date().toISOString()
      });
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  return {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    logOut
  };
};