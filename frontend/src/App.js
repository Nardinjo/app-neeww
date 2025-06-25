import React, { useState, useEffect } from 'react';
import './App.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { where, orderBy } from 'firebase/firestore';

// Firebase imports
import { useAuth } from './hooks/useAuth';
import { useFirestore, firestoreService } from './hooks/useFirestore';
import { doc, updateDoc, deleteDoc, collection, query, getDocs } from 'firebase/firestore';
import { db } from './firebase-config';
import { clearAllData } from './utils/resetData';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Translations
const translations = {
  en: {
    // App Title & Header
    appTitle: "Budget Planner Pro",
    appSubtitle: "Track, analyze, and manage your finances",
    welcome: "Welcome",
    admin: "Admin",
    logout: "Logout",
    
    // Authentication
    login: "Login",
    signup: "Sign Up",
    email: "Email",
    password: "Password",
    username: "Username",
    confirmPassword: "Confirm Password",
    enterEmail: "Enter your email",
    enterPassword: "Enter your password",
    chooseUsername: "Choose a username",
    createPassword: "Create a password",
    confirmYourPassword: "Confirm your password",
    approvalNote: "New accounts require admin approval (except leonard.lamaj@gmail.com)",
    accountCreated: "Account created! Please wait for admin approval.",
    adminCreated: "Admin account created and approved!",
    emailExists: "Email already registered",
    passwordsNoMatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    fillAllFields: "Please fill all fields",
    invalidCredentials: "Invalid email or password",
    pendingApproval: "Your account is pending admin approval",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    backToLogin: "Back to Login",
    resetEmailSent: "Password reset email sent! Check your inbox.",
    resetEmailError: "Error sending reset email. Please try again.",
    
    // Password Management
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmNewPassword: "Confirm New Password",
    passwordChanged: "Password changed successfully!",
    wrongCurrentPassword: "Current password is incorrect",
    enterCurrentPassword: "Enter your current password",
    enterNewPassword: "Enter new password",
    confirmNewPasswordPlaceholder: "Confirm new password",
    profile: "Profile",
    accountSettings: "Account Settings",
    
    // Reset functionality
    resetApp: "Reset App",
    confirmReset: "Are you sure you want to reset ALL data? This will delete all users and transactions permanently!",
    resetComplete: "App reset successfully! Please refresh the page.",
    resetFailed: "Reset failed. Please try again.",
    
    // Navigation
    dashboard: "Dashboard",
    charts: "Charts",
    transactions: "Transactions",
    
    // Dashboard
    totalIncome: "Total Income",
    totalExpenses: "Total Expenses",
    netBalance: "Net Balance",
    addNewTransaction: "Add New Transaction",
    description: "Description",
    amount: "Amount",
    type: "Type",
    category: "Category",
    income: "Income",
    expense: "Expense",
    addTransaction: "Add Transaction",
    enterDescription: "Enter description",
    
    // Categories
    food: "Food",
    transportation: "Transportation",
    entertainment: "Entertainment",
    shopping: "Shopping",
    bills: "Bills",
    healthcare: "Healthcare",
    education: "Education",
    travel: "Travel",
    general: "General",
    
    // Multi-user
    viewOthersBudgets: "View Other Users' Budgets",
    myBudget: "My Budget",
    readOnlyMode: "You are viewing {username}'s budget (read-only)",
    canOnlyAdd: "You can only add transactions to your own budget",
    canOnlyEdit: "You can only edit your own transactions",
    canOnlyDelete: "You can only delete your own transactions",
    
    // Admin Panel
    adminPanel: "Admin Panel",
    userManagement: "User Management",
    pendingApprovals: "Pending Approvals:",
    approvedUsers: "Approved Users:",
    noPendingApprovals: "No pending approvals",
    approve: "Approve",
    reject: "Reject",
    remove: "Remove",
    userApproved: "User {username} has been approved!",
    userRejected: "User rejected and removed",
    userRemoved: "User {username} has been removed",
    confirmRemoveUser: "Are you sure you want to permanently remove user {username}? This will delete all their data.",
    cannotRemoveSelf: "You cannot remove your own admin account",
    
    // Charts
    monthlyTrends: "Monthly Trends",
    expenseCategories: "Expense Categories",
    incomeVsExpenses: "Income vs Expenses (Last 6 Months)",
    spendingByCategory: "Spending by Category",
    
    // Transactions
    dateFilter: "Date Filter",
    clearFilter: "Clear Filter",
    exportCSV: "Export CSV",
    exportJSON: "Export JSON",
    startDate: "Start Date",
    endDate: "End Date",
    filtered: "filtered",
    noTransactionsFound: "No transactions found for the selected criteria.",
    editTransaction: "Edit transaction",
    deleteTransaction: "Delete transaction",
    editTransactionModal: "Edit Transaction",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    validDescription: "Please enter a valid description and amount",
    confirmDelete: "Are you sure you want to delete this transaction?",
    
    // Footer & Misc
    dataSavedLocally: "Cloud synchronized • {count} transactions • Data synced across devices",
    language: "Language",
    english: "English",
    albanian: "Albanian",
    
    // Cloud sync status
    online: "Online - Data syncing",
    offline: "Offline - Using cached data",
    syncing: "Syncing data...",
    syncError: "Sync error - Check connection"
  },
  
  al: {
    // App Title & Header
    appTitle: "Planifikuesi i Buxhetit Pro",
    appSubtitle: "Gjurmo, analizo dhe menaxho financat tuaja",
    welcome: "Mirësevini",
    admin: "Admin",
    logout: "Dilni",
    
    // Authentication
    login: "Hyrje",
    signup: "Regjistrimi",
    email: "Email",
    password: "Fjalëkalimi",
    username: "Emri i përdoruesit",
    confirmPassword: "Konfirmoni fjalëkalimin",
    enterEmail: "Futni email-in tuaj",
    enterPassword: "Futni fjalëkalimin tuaj",
    chooseUsername: "Zgjidhni një emër përdoruesi",
    createPassword: "Krijoni një fjalëkalim",
    confirmYourPassword: "Konfirmoni fjalëkalimin tuaj",
    approvalNote: "Llogaritë e reja kërkojnë miratim nga administratori (përveç leonard.lamaj@gmail.com)",
    accountCreated: "Llogaria u krijua! Ju lutemi prisni miratimin e administratorit.",
    adminCreated: "Llogaria e administratorit u krijua dhe u miratua!",
    emailExists: "Email-i është tashmë i regjistruar",
    passwordsNoMatch: "Fjalëkalimet nuk përputhen",
    passwordTooShort: "Fjalëkalimi duhet të ketë të paktën 6 karaktere",
    fillAllFields: "Ju lutemi plotësoni të gjitha fushat",
    invalidCredentials: "Email ose fjalëkalim i pavlefshëm",
    pendingApproval: "Llogaria juaj është në pritje të miratimit të administratorit",
    forgotPassword: "Keni harruar fjalëkalimin?",
    resetPassword: "Rivendosni Fjalëkalimin",
    backToLogin: "Kthehu tek Hyrja",
    resetEmailSent: "Email-i për rivendosjen e fjalëkalimit u dërgua! Kontrolloni kutinë tuaj.",
    resetEmailError: "Gabim në dërgimin e email-it. Ju lutemi provoni përsëri.",
    
    // Password Management
    changePassword: "Ndryshoni Fjalëkalimin",
    currentPassword: "Fjalëkalimi Aktual",
    newPassword: "Fjalëkalimi i Ri",
    confirmNewPassword: "Konfirmoni Fjalëkalimin e Ri",
    passwordChanged: "Fjalëkalimi u ndryshua me sukses!",
    wrongCurrentPassword: "Fjalëkalimi aktual është i pasaktë",
    enterCurrentPassword: "Futni fjalëkalimin tuaj aktual",
    enterNewPassword: "Futni fjalëkalimin e ri",
    confirmNewPasswordPlaceholder: "Konfirmoni fjalëkalimin e ri",
    profile: "Profili",
    accountSettings: "Cilësimet e Llogarisë",
    
    // Reset functionality
    resetApp: "Rivendos Aplikacionin",
    confirmReset: "Jeni të sigurt që doni të rivendosni TË GJITHA të dhënat? Kjo do të fshijë të gjithë përdoruesit dhe transaksionet përgjithmonë!",
    resetComplete: "Aplikacioni u rivendos me sukses! Ju lutemi rifreskoni faqen.",
    resetFailed: "Rivendosja dështoi. Ju lutemi provoni përsëri.",
    
    // Navigation
    dashboard: "Paneli",
    charts: "Grafikët",
    transactions: "Transaksionet",
    
    // Dashboard
    totalIncome: "Të Ardhurat Totale",
    totalExpenses: "Shpenzimet Totale",
    netBalance: "Bilanci Neto",
    addNewTransaction: "Shto Transaksion të Ri",
    description: "Përshkrimi",
    amount: "Shuma",
    type: "Lloji",
    category: "Kategoria",
    income: "Të Ardhura",
    expense: "Shpenzim",
    addTransaction: "Shto Transaksion",
    enterDescription: "Futni përshkrimin",
    
    // Categories
    food: "Ushqim",
    transportation: "Transport",
    entertainment: "Argëtim",
    shopping: "Blerje",
    bills: "Fatura",
    healthcare: "Shëndetësi",
    education: "Arsim",
    travel: "Udhëtim",
    general: "Të Përgjithshme",
    
    // Multi-user
    viewOthersBudgets: "Shiko Buxhetet e Përdoruesve të Tjerë",
    myBudget: "Buxheti Im",
    readOnlyMode: "Po shikoni buxhetin e {username} (vetëm lexim)",
    canOnlyAdd: "Mund të shtoni transaksione vetëm në buxhetin tuaj",
    canOnlyEdit: "Mund të redaktoni vetëm transaksionet tuaja",
    canOnlyDelete: "Mund të fshini vetëm transaksionet tuaja",
    
    // Admin Panel
    adminPanel: "Paneli i Administratorit",
    userManagement: "Menaxhimi i Përdoruesve",
    pendingApprovals: "Miratimet në Pritje:",
    approvedUsers: "Përdoruesit e Miratuar:",
    noPendingApprovals: "Nuk ka miratim në pritje",
    approve: "Mirato",
    reject: "Refuzo",
    remove: "Hiq",
    userApproved: "Përdoruesi {username} u miratua!",
    userRejected: "Përdoruesi u refuzua dhe u hoq",
    userRemoved: "Përdoruesi {username} u hoq",
    confirmRemoveUser: "Jeni të sigurt që doni të hiqni përgjithmonë përdoruesin {username}? Kjo do të fshijë të gjitha të dhënat e tyre.",
    cannotRemoveSelf: "Nuk mund të hiqni llogarinë tuaj të administratorit",
    
    // Charts
    monthlyTrends: "Trendet Mujore",
    expenseCategories: "Kategoritë e Shpenzimeve",
    incomeVsExpenses: "Të Ardhurat kundrejt Shpenzimeve (6 Muajt e Fundit)",
    spendingByCategory: "Shpenzimet sipas Kategorisë",
    
    // Transactions
    dateFilter: "Filtri i Datës",
    clearFilter: "Pastro Filtrin",
    exportCSV: "Eksporto CSV",
    exportJSON: "Eksporto JSON",
    startDate: "Data e Fillimit",
    endDate: "Data e Mbarimit",
    filtered: "të filtruara",
    noTransactionsFound: "Nuk u gjetën transaksione për kriteret e zgjedhura.",
    editTransaction: "Redakto transaksionin",
    deleteTransaction: "Fshi transaksionin",
    editTransactionModal: "Redakto Transaksionin",
    saveChanges: "Ruaj Ndryshimet",
    cancel: "Anulo",
    validDescription: "Ju lutemi futni një përshkrim dhe shumë të vlefshme",
    confirmDelete: "Jeni të sigurt që doni të fshini këtë transaksion?",
    
    // Footer & Misc
    dataSavedLocally: "Sinkronizuar në re • {count} transaksione • Të dhënat sinkronizuar në të gjitha pajisjet",
    language: "Gjuha",
    english: "Anglisht",
    albanian: "Shqip",
    
    // Cloud sync status
    online: "Online - Duke sinkronizuar të dhënat",
    offline: "Offline - Duke përdorur të dhënat e ruajtura",
    syncing: "Duke sinkronizuar të dhënat...",
    syncError: "Gabim sinkronizimi - Kontrolloni lidhjen"
  }
};

function App() {
  // Firebase authentication
  const { user, userProfile, loading, signUp, signIn, logOut, changePassword, resetPassword } = useAuth();
  
  // Language state
  const [language, setLanguage] = useState('en');
  
  // Translation helper
  const t = (key, params = {}) => {
    let text = translations[language][key] || translations.en[key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  };

  // Authentication state
  const [showLogin, setShowLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  // Admin constants
  const ADMIN_EMAIL = 'leonard.lamaj@gmail.com';
  
  // State for transactions
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income');
  const [category, setCategory] = useState('General');
  
  // Date filtering
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);
  
  // Edit transaction
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState('income');
  const [editCategory, setEditCategory] = useState('General');
  
  // View state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState(navigator.onLine);

  // Firebase data hooks
  const { data: allUsers } = useFirestore('users');
  const { data: allTransactions } = useFirestore('transactions', [], 'createdAt');
  
  // Filter transactions for current user or selected user
  const currentUserId = selectedUserData ? selectedUserData.uid : user?.uid;
  const userTransactions = allTransactions.filter(t => t.userId === currentUserId);

  // Categories for expenses
  const categories = [
    t('food'), t('transportation'), t('entertainment'), t('shopping'), 
    t('bills'), t('healthcare'), t('education'), t('travel'), t('general')
  ];

  // Load language preference from userProfile
  useEffect(() => {
    if (userProfile?.language) {
      setLanguage(userProfile.language);
    }
  }, [userProfile]);

  // Save language preference to Firebase
  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    if (user && userProfile) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          language: newLanguage
        });
      } catch (error) {
        console.error('Error updating language:', error);
      }
    }
  };

  // Online status monitoring
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Reset all data function
  const handleResetApp = async () => {
    if (window.confirm(t('confirmReset'))) {
      try {
        await logOut(); // Logout first
        const success = await clearAllData();
        if (success) {
          alert(t('resetComplete'));
          window.location.reload(); // Refresh the page
        } else {
          alert(t('resetFailed'));
        }
      } catch (error) {
        console.error('Reset error:', error);
        alert(t('resetFailed'));
      }
    }
  };

  // User management functions
  const getPendingUsers = () => {
    return allUsers.filter(user => !user.isApproved && user.email !== ADMIN_EMAIL);
  };

  const getApprovedUsers = () => {
    return allUsers.filter(user => user.isApproved || user.email === ADMIN_EMAIL);
  };

  // Authentication functions
  const handleSignup = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = signupData;
    
    if (!username || !email || !password || !confirmPassword) {
      alert(t('fillAllFields'));
      return;
    }
    
    if (password !== confirmPassword) {
      alert(t('passwordsNoMatch'));
      return;
    }
    
    if (password.length < 6) {
      alert(t('passwordTooShort'));
      return;
    }
    
    try {
      await signUp(email, password, username);
      
      if (email === ADMIN_EMAIL) {
        alert(t('adminCreated'));
      } else {
        alert(t('accountCreated'));
      }
      
      setSignupData({ username: '', email: '', password: '', confirmPassword: '' });
      setShowLogin(true);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert(t('emailExists'));
      } else {
        alert(error.message);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginData;
    
    if (!email || !password) {
      alert(t('fillAllFields'));
      return;
    }
    
    try {
      await signIn(email, password);
      setLoginData({ email: '', password: '' });
    } catch (error) {
      if (error.message === 'Account pending approval') {
        alert(t('pendingApproval'));
      } else {
        alert(t('invalidCredentials'));
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail) {
      alert(t('enterEmail'));
      return;
    }
    
    try {
      await resetPassword(forgotPasswordEmail);
      alert(t('resetEmailSent'));
      setShowForgotPassword(false);
      setForgotPasswordEmail('');
    } catch (error) {
      alert(t('resetEmailError'));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = changePasswordData;
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert(t('fillAllFields'));
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      alert(t('passwordsNoMatch'));
      return;
    }
    
    if (newPassword.length < 6) {
      alert(t('passwordTooShort'));
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      alert(t('passwordChanged'));
      setShowChangePassword(false);
      setChangePasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        alert(t('wrongCurrentPassword'));
      } else {
        alert(error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      setSelectedUserData(null);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const approveUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isApproved: true
      });
      const user = allUsers.find(u => u.uid === userId);
      alert(t('userApproved', { username: user.username }));
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const rejectUser = async (userId) => {
    try {
      const user = allUsers.find(u => u.uid === userId);
      if (window.confirm(t('confirmRemoveUser', { username: user.username }))) {
        // Delete user document
        await deleteDoc(doc(db, 'users', userId));
        
        // Delete user's transactions
        const userTransactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(userTransactionsQuery);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        alert(t('userRejected'));
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const removeUser = async (userId) => {
    if (userId === user.uid) {
      alert(t('cannotRemoveSelf'));
      return;
    }

    try {
      const userToRemove = allUsers.find(u => u.uid === userId);
      if (!userToRemove) return;

      if (window.confirm(t('confirmRemoveUser', { username: userToRemove.username }))) {
        // Delete user document
        await deleteDoc(doc(db, 'users', userId));
        
        // Delete user's transactions
        const userTransactionsQuery = query(
          collection(db, 'transactions'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(userTransactionsQuery);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // If currently viewing this user's data, switch back to own data
        if (selectedUserData && selectedUserData.uid === userId) {
          setSelectedUserData(null);
        }
        
        alert(t('userRemoved', { username: userToRemove.username }));
      }
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  // Filter transactions by date range
  const getFilteredTransactions = () => {
    if (!startDate && !endDate) return userTransactions;
    
    return userTransactions.filter(transaction => {
      const transactionDate = parseISO(transaction.dateISO);
      if (startDate && endDate) {
        return isWithinInterval(transactionDate, {
          start: parseISO(startDate),
          end: parseISO(endDate)
        });
      } else if (startDate) {
        return transactionDate >= parseISO(startDate);
      } else if (endDate) {
        return transactionDate <= parseISO(endDate);
      }
      return true;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculate totals from filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Add new transaction (only if viewing own data)
  const addTransaction = async (e) => {
    e.preventDefault();
    
    if (selectedUserData && selectedUserData.uid !== user.uid) {
      alert(t('canOnlyAdd'));
      return;
    }
    
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      alert(t('validDescription'));
      return;
    }

    try {
      const now = new Date();
      const transactionData = {
        description: description.trim(),
        amount: parseFloat(amount),
        type: type,
        category: type === 'expense' ? category : t('income'),
        date: now.toLocaleDateString(),
        dateISO: now.toISOString().split('T')[0],
        userId: user.uid
      };

      await firestoreService.add('transactions', transactionData);
      
      setDescription('');
      setAmount('');
      setCategory(t('general'));
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  // Edit transaction (only if viewing own data)
  const startEdit = (transaction) => {
    if (selectedUserData && selectedUserData.uid !== user.uid) {
      alert(t('canOnlyEdit'));
      return;
    }
    
    setEditingTransaction(transaction);
    setEditDescription(transaction.description);
    setEditAmount(transaction.amount.toString());
    setEditType(transaction.type);
    setEditCategory(transaction.category);
  };

  const saveEdit = async () => {
    if (!editDescription.trim() || !editAmount || parseFloat(editAmount) <= 0) {
      alert(t('validDescription'));
      return;
    }

    try {
      const updateData = {
        description: editDescription.trim(),
        amount: parseFloat(editAmount),
        type: editType,
        category: editType === 'expense' ? editCategory : t('income')
      };

      await firestoreService.update('transactions', editingTransaction.id, updateData);
      
      setEditingTransaction(null);
      setEditDescription('');
      setEditAmount('');
      setEditType('income');
      setEditCategory(t('general'));
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    setEditDescription('');
    setEditAmount('');
    setEditType('income');
    setEditCategory(t('general'));
  };

  // Delete transaction (only if viewing own data)
  const deleteTransaction = async (transactionId) => {
    if (selectedUserData && selectedUserData.uid !== user.uid) {
      alert(t('canOnlyDelete'));
      return;
    }
    
    if (window.confirm(t('confirmDelete'))) {
      try {
        await firestoreService.delete('transactions', transactionId);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  // Export data
  const exportToCSV = () => {
    const headers = [t('date'), t('description'), t('type'), t('category'), t('amount')];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => 
        [t.date, `"${t.description}"`, t.type, t.category, t.amount].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const userName = selectedUserData ? selectedUserData.username : userProfile.username;
    link.download = `budget-${userName}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredTransactions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const userName = selectedUserData ? selectedUserData.username : userProfile.username;
    link.download = `budget-${userName}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Chart data preparation
  const getMonthlyData = () => {
    const monthlyData = {};
    
    userTransactions.forEach(transaction => {
      const date = parseISO(transaction.dateISO);
      const monthKey = format(date, 'yyyy-MM');
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const last6Months = sortedMonths.slice(-6);

    return {
      labels: last6Months.map(month => format(parseISO(month + '-01'), 'MMM yyyy')),
      datasets: [
        {
          label: t('income'),
          data: last6Months.map(month => monthlyData[month].income),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2
        },
        {
          label: t('expense'),
          data: last6Months.map(month => monthlyData[month].expenses),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2
        }
      ]
    };
  };

  const getCategoryData = () => {
    const categoryTotals = {};
    
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        categoryTotals[transaction.category] = (categoryTotals[transaction.category] || 0) + transaction.amount;
      });

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);

    return {
      labels: sortedCategories.map(([category]) => category),
      datasets: [{
        data: sortedCategories.map(([, amount]) => amount),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
          '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setShowDateFilter(false);
  };

  const switchToUserView = (userData) => {
    setSelectedUserData(userData);
    setActiveTab('dashboard');
  };

  const switchToOwnView = () => {
    setSelectedUserData(null);
    setActiveTab('dashboard');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Forgot Password UI
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔐</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('resetPassword')}</h1>
            <p className="text-gray-600">Enter your email to reset your password</p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                placeholder={t('enterEmail')}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {t('resetPassword')}
            </button>
          </form>
          
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotPasswordEmail('');
              }}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              {t('backToLogin')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Login/Signup UI
  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">


          {/* Language Selector - LARGE AND VISIBLE */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 flex border-2 border-purple-200">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-6 py-3 rounded-lg text-base font-bold transition-all ${
                  language === 'en' 
                    ? 'bg-purple-500 text-white shadow-lg transform scale-105' 
                    : 'bg-white text-purple-600 hover:bg-purple-50'
                }`}
              >
                🇺🇸 {t('english')}
              </button>
              <button
                onClick={() => changeLanguage('al')}
                className={`ml-2 px-6 py-3 rounded-lg text-base font-bold transition-all ${
                  language === 'al' 
                    ? 'bg-purple-500 text-white shadow-lg transform scale-105' 
                    : 'bg-white text-purple-600 hover:bg-purple-50'
                }`}
              >
                🇦🇱 {t('albanian')}
              </button>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">💰 {t('appTitle')}</h1>
            <p className="text-gray-600">{t('appSubtitle')}</p>
            
            {/* Connection Status */}
            <div className={`mt-2 text-xs px-3 py-1 rounded-full inline-block ${
              onlineStatus ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {onlineStatus ? t('online') : t('offline')}
            </div>
          </div>

          <div className="flex mb-6">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-all ${
                showLogin 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-all ${
                !showLogin 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('signup')}
            </button>
          </div>

          {showLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder={t('enterEmail')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder={t('enterPassword')}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {t('login')}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                >
                  {t('forgotPassword')}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('username')}</label>
                <input
                  type="text"
                  value={signupData.username}
                  onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder={t('chooseUsername')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder={t('enterEmail')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('password')}</label>
                <input
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder={t('createPassword')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmPassword')}</label>
                <input
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder={t('confirmYourPassword')}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {t('signup')}
              </button>
              <p className="text-xs text-gray-500 text-center">
                {t('approvalNote')}
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // Check if user is approved
  if (!userProfile.isApproved && userProfile.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md text-center">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Pending</h2>
          <p className="text-gray-600 mb-6">{t('pendingApproval')}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
          >
            {t('logout')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
          <div className="flex flex-wrap items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                💰 {t('appTitle')}
              </h1>
              <p className="text-gray-600">
                {t('welcome')}, {userProfile.username}! {selectedUserData && t('readOnlyMode', { username: selectedUserData.username })}
                {userProfile.isAdmin && <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-full">{t('admin')}</span>}
              </p>
              
              {/* Connection Status */}
              <div className={`mt-1 text-xs px-2 py-1 rounded-full inline-block ${
                onlineStatus ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              }`}>
                {onlineStatus ? t('online') : t('offline')}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language Selector - LARGE AND VISIBLE */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-2 flex border border-purple-300">
                <button
                  onClick={() => changeLanguage('en')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    language === 'en' 
                      ? 'bg-purple-500 text-white shadow-lg' 
                      : 'bg-white text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  🇺🇸 EN
                </button>
                <button
                  onClick={() => changeLanguage('al')}
                  className={`ml-1 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                    language === 'al' 
                      ? 'bg-purple-500 text-white shadow-lg' 
                      : 'bg-white text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  🇦🇱 AL
                </button>
              </div>
              
              {/* Profile/Settings Button */}
              <button
                onClick={() => setShowChangePassword(true)}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all"
                title={t('accountSettings')}
              >
                ⚙️ {t('profile')}
              </button>
              
              {selectedUserData && (
                <button
                  onClick={switchToOwnView}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  {t('myBudget')}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        </div>

        {/* User Selection for All Users */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 {t('viewOthersBudgets')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {getApprovedUsers()
              .filter(userData => userData.uid !== user.uid)
              .map(userData => (
                <button
                  key={userData.uid}
                  onClick={() => switchToUserView(userData)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedUserData?.uid === userData.uid
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👤</div>
                    <p className="font-medium">{userData.username}</p>
                    <p className="text-sm text-gray-500">{userData.email}</p>
                    {userData.isAdmin && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{t('admin')}</span>}
                  </div>
                </button>
              ))}
            {getApprovedUsers().filter(userData => userData.uid !== user.uid).length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No other users yet. Share the app with others!</p>
              </div>
            )}
          </div>
        </div>

        {/* Admin Panel - ENHANCED VISIBILITY */}
        {userProfile.isAdmin && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 shadow-lg mb-8 border-2 border-red-200">
            <div className="flex items-center mb-4">
              <div className="bg-red-500 text-white p-2 rounded-full mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-800">🔧 {t('adminPanel')}</h2>
              <div className="ml-auto bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                ADMIN ONLY
              </div>
            </div>
            
            {/* Pending Approvals */}
            <div className="mb-8 bg-white rounded-xl p-4 border-l-4 border-yellow-400">
              <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center">
                ⏳ {t('pendingApprovals')}
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  {getPendingUsers().length} {getPendingUsers().length === 1 ? 'user' : 'users'}
                </span>
              </h3>
              {getPendingUsers().length > 0 ? (
                <div className="space-y-3">
                  {getPendingUsers().map(userData => (
                    <div key={userData.uid} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <p className="font-bold text-gray-800">{userData.username}</p>
                        <p className="text-sm text-gray-600">{userData.email}</p>
                        <p className="text-xs text-gray-500">Created: {new Date(userData.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveUser(userData.uid)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium shadow-lg"
                        >
                          ✅ {t('approve')}
                        </button>
                        <button
                          onClick={() => rejectUser(userData.uid)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium shadow-lg"
                        >
                          ❌ {t('reject')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-gray-500 font-medium">{t('noPendingApprovals')}</p>
                </div>
              )}
            </div>

            {/* Approved Users Management - HIGHLIGHTED REMOVE SECTION */}
            <div className="bg-white rounded-xl p-4 border-l-4 border-red-400">
              <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                🗑️ {t('userManagement')} - {t('approvedUsers')}
                <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  {getApprovedUsers().filter(userData => userData.uid !== user.uid).length} users
                </span>
              </h3>
              
              {getApprovedUsers().filter(userData => userData.uid !== user.uid).length > 0 ? (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <p className="text-red-800 text-sm font-medium flex items-center">
                      ⚠️ <strong className="ml-1">WARNING:</strong> 
                      <span className="ml-1">Removing users will permanently delete their accounts and ALL transaction data!</span>
                    </p>
                  </div>
                  
                  {getApprovedUsers()
                    .filter(userData => userData.uid !== user.uid)
                    .map(userData => (
                      <div key={userData.uid} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-2 border-red-200 hover:border-red-400 transition-all">
                        <div className="flex items-center">
                          <div className="bg-red-100 p-2 rounded-full mr-3">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{userData.username}</p>
                            <p className="text-sm text-gray-600">{userData.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {userData.isAdmin && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">{t('admin')}</span>}
                              <span className="text-xs text-gray-500">Approved: {new Date(userData.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeUser(userData.uid)}
                          className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold shadow-lg transform hover:scale-105 flex items-center"
                        >
                          🗑️ {t('remove')}
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-2">👤</div>
                  <p className="text-gray-500 font-medium">No other users to manage</p>
                  <p className="text-gray-400 text-sm">Share the app with others to see users here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center mb-8 bg-white rounded-2xl p-2 shadow-lg">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 {t('dashboard')}
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'charts'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📈 {t('charts')}
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'transactions'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 {t('transactions')}
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Income */}
              <div className="bg-green-100 rounded-2xl p-6 shadow-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">{t('totalIncome')}</p>
                    <p className="text-2xl font-bold text-green-800">${totalIncome.toFixed(2)}</p>
                  </div>
                  <div className="bg-green-200 p-3 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Total Expenses */}
              <div className="bg-red-100 rounded-2xl p-6 shadow-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">{t('totalExpenses')}</p>
                    <p className="text-2xl font-bold text-red-800">${totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="bg-red-200 p-3 rounded-full">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Net Balance */}
              <div className={`${netBalance >= 0 ? 'bg-blue-100 border-blue-200' : 'bg-orange-100 border-orange-200'} rounded-2xl p-6 shadow-lg border`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'} text-sm font-medium`}>{t('netBalance')}</p>
                    <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                      {netBalance >= 0 ? '+' : ''}${netBalance.toFixed(2)}
                    </p>
                  </div>
                  <div className={`${netBalance >= 0 ? 'bg-blue-200' : 'bg-orange-200'} p-3 rounded-full`}>
                    <svg className={`w-6 h-6 ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={netBalance >= 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Transaction Form - Only show if viewing own data */}
            {(!selectedUserData || selectedUserData.uid === user.uid) && (
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('addNewTransaction')}</h2>
                <form onSubmit={addTransaction} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('enterDescription')}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('amount')}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="income">💰 {t('income')}</option>
                        <option value="expense">💸 {t('expense')}</option>
                      </select>
                    </div>
                    {type === 'expense' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        >
                          {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                    >
                      {t('addTransaction')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Read-only message for viewing others' data */}
            {selectedUserData && selectedUserData.uid !== user.uid && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 text-center">
                <p className="text-blue-800">👀 {t('readOnlyMode', { username: selectedUserData.username })}</p>
              </div>
            )}
          </>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-8">
            {/* Monthly Trends Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 {t('monthlyTrends')}</h2>
              <div className="h-80">
                <Bar 
                  data={getMonthlyData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                      title: {
                        display: true,
                        text: t('incomeVsExpenses')
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '$' + value.toFixed(0);
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>

            {/* Category Breakdown */}
            {filteredTransactions.filter(t => t.type === 'expense').length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">🍰 {t('expenseCategories')}</h2>
                <div className="h-80">
                  <Doughnut 
                    data={getCategoryData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        title: {
                          display: true,
                          text: t('spendingByCategory')
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <>
            {/* Filter and Export Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                  >
                    📅 {t('dateFilter')}
                  </button>
                  
                  {(startDate || endDate) && (
                    <button
                      onClick={clearDateFilter}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                    >
                      {t('clearFilter')}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                  >
                    📊 {t('exportCSV')}
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                  >
                    📄 {t('exportJSON')}
                  </button>
                </div>
              </div>

              {/* Date Filter */}
              {showDateFilter && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('startDate')}</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('endDate')}</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📋 {t('transactions')} {(startDate || endDate) && `(${filteredTransactions.length} ${t('filtered')})`}
              </h2>
              
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <p className="text-gray-500">{t('noTransactionsFound')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTransactions.slice().reverse().map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-l-4 ${
                        transaction.type === 'income'
                          ? 'bg-green-50 border-green-400'
                          : 'bg-red-50 border-red-400'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-200' : 'bg-red-200'
                        }`}>
                          {transaction.type === 'income' ? (
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{transaction.description}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{transaction.date}</span>
                            <span>•</span>
                            <span>{transaction.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`font-bold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </span>
                        
                        {/* Only show edit/delete for own transactions */}
                        {(!selectedUserData || selectedUserData.uid === user.uid) && (
                          <>
                            <button
                              onClick={() => startEdit(transaction)}
                              className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-all"
                              title={t('editTransaction')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteTransaction(transaction.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-all"
                              title={t('deleteTransaction')}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Edit Transaction Modal */}
        {editingTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">✏️ {t('editTransactionModal')}</h2>
              <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('description')}</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('amount')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="income">💰 {t('income')}</option>
                    <option value="expense">💸 {t('expense')}</option>
                  </select>
                </div>
                {editType === 'expense' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('category')}</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    >
                      {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    {t('saveChanges')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Change Password Modal */}
        {showChangePassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">🔐 {t('changePassword')}</h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('currentPassword')}</label>
                  <input
                    type="password"
                    value={changePasswordData.currentPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, currentPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('enterCurrentPassword')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('newPassword')}</label>
                  <input
                    type="password"
                    value={changePasswordData.newPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, newPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('enterNewPassword')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirmNewPassword')}</label>
                  <input
                    type="password"
                    value={changePasswordData.confirmNewPassword}
                    onChange={(e) => setChangePasswordData({...changePasswordData, confirmNewPassword: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    placeholder={t('confirmNewPasswordPlaceholder')}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setChangePasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                    }}
                    className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all"
                  >
                    {t('changePassword')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>{t('dataSavedLocally', { count: userTransactions.length })}</p>
        </div>
      </div>
    </div>
  );
}

export default App;