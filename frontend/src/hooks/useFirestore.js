import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase-config';

// Hook for real-time data listening
export const useFirestore = (collectionName, conditions = [], orderByField = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      let q = collection(db, collectionName);
      
      // Apply conditions
      conditions.forEach(condition => {
        q = query(q, condition);
      });
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, 'desc'));
      }
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setData(documents);
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, [collectionName, JSON.stringify(conditions), orderByField]);

  return { data, loading, error };
};

// Firestore CRUD operations
export const firestoreService = {
  // Add document
  add: async (collectionName, data) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Update document
  update: async (collectionName, docId, data) => {
    try {
      await updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  },

  // Delete document
  delete: async (collectionName, docId) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
    } catch (error) {
      throw error;
    }
  },

  // Get all documents (one-time read)
  getAll: async (collectionName, conditions = []) => {
    try {
      let q = collection(db, collectionName);
      
      conditions.forEach(condition => {
        q = query(q, condition);
      });
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  }
};