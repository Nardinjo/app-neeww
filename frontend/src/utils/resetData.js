import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

// Function to clear all Firestore data
export const clearAllData = async () => {
  try {
    console.log('Starting data cleanup...');
    
    // Clear all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const userDeletePromises = usersSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(userDeletePromises);
    console.log(`Deleted ${usersSnapshot.docs.length} users`);
    
    // Clear all transactions
    const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
    const transactionDeletePromises = transactionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(transactionDeletePromises);
    console.log(`Deleted ${transactionsSnapshot.docs.length} transactions`);
    
    // Clear local storage
    localStorage.clear();
    console.log('Cleared local storage');
    
    console.log('✅ All data cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};