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
    editTransaction: "Edit Transaction",
    deleteTransaction: "Delete transaction",
    editTransactionModal: "Edit Transaction",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    validDescription: "Please enter a valid description and amount",
    confirmDelete: "Are you sure you want to delete this transaction?",
    
    // Footer & Misc
    dataSavedLocally: "Multi-user budget management • {count} transactions • Data saved locally",
    language: "Language",
    english: "English",
    albanian: "Albanian"
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
    dataSavedLocally: "Menaxhimi i buxhetit shumë-përdorues • {count} transaksione • Të dhënat ruhen lokalisht",
    language: "Gjuha",
    english: "Anglisht",
    albanian: "Shqip"
  }
};

function App() {
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
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  // Admin constants
  const ADMIN_EMAIL = 'leonard.lamaj@gmail.com';
  
  // State for transactions
  const [transactions, setTransactions] = useState([]);
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

  // Categories for expenses
  const categories = [
    t('food'), t('transportation'), t('entertainment'), t('shopping'), 
    t('bills'), t('healthcare'), t('education'), t('travel'), t('general')
  ];

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('budgetAppLanguage');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'al')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('budgetAppLanguage', newLanguage);
  };

  // Initialize app - check for logged in user
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsLoggedIn(true);
      loadUserTransactions(user.email);
    }
  }, []);

  // User management functions
  const getAllUsers = () => {
    const users = localStorage.getItem('budgetUsers');
    return users ? JSON.parse(users) : [];
  };

  const saveUser = (user) => {
    const users = getAllUsers();
    const existingIndex = users.findIndex(u => u.email === user.email);
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem('budgetUsers', JSON.stringify(users));
  };

  const removeUser = (userEmail) => {
    if (userEmail === currentUser.email) {
      alert(t('cannotRemoveSelf'));
      return;
    }

    const user = getAllUsers().find(u => u.email === userEmail);
    if (!user) return;

    if (window.confirm(t('confirmRemoveUser', { username: user.username }))) {
      // Remove user from users list
      const users = getAllUsers().filter(u => u.email !== userEmail);
      localStorage.setItem('budgetUsers', JSON.stringify(users));
      
      // Remove user's transaction data
      const userTransactionKey = getUserTransactionKey(userEmail);
      localStorage.removeItem(userTransactionKey);
      
      // If currently viewing this user's data, switch back to own data
      if (selectedUserData && selectedUserData.email === userEmail) {
        setSelectedUserData(null);
        loadUserTransactions(currentUser.email);
      }
      
      alert(t('userRemoved', { username: user.username }));
    }
  };

  const getPendingUsers = () => {
    return getAllUsers().filter(user => !user.isApproved && user.email !== ADMIN_EMAIL);
  };

  const getApprovedUsers = () => {
    return getAllUsers().filter(user => user.isApproved || user.email === ADMIN_EMAIL);
  };

  // Authentication functions
  const handleSignup = (e) => {
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
    
    const users = getAllUsers();
    if (users.some(user => user.email === email)) {
      alert(t('emailExists'));
      return;
    }
    
    const newUser = {
      username,
      email,
      password, // In real app, this would be hashed
      isApproved: email === ADMIN_EMAIL, // Auto-approve admin
      isAdmin: email === ADMIN_EMAIL,
      createdAt: new Date().toISOString()
    };
    
    saveUser(newUser);
    
    if (email === ADMIN_EMAIL) {
      alert(t('adminCreated'));
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } else {
      alert(t('accountCreated'));
    }
    
    setSignupData({ username: '', email: '', password: '', confirmPassword: '' });
    setShowLogin(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password } = loginData;
    
    if (!email || !password) {
      alert(t('fillAllFields'));
      return;
    }
    
    const users = getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      alert(t('invalidCredentials'));
      return;
    }
    
    if (!user.isApproved && email !== ADMIN_EMAIL) {
      alert(t('pendingApproval'));
      return;
    }
    
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
    loadUserTransactions(email);
    setLoginData({ email: '', password: '' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    setTransactions([]);
    setSelectedUserData(null);
    localStorage.removeItem('currentUser');
    setActiveTab('dashboard');
  };

  const approveUser = (userEmail) => {
    const users = getAllUsers();
    const user = users.find(u => u.email === userEmail);
    if (user) {
      user.isApproved = true;
      saveUser(user);
      alert(t('userApproved', { username: user.username }));
    }
  };

  const rejectUser = (userEmail) => {
    if (window.confirm(t('confirmRemoveUser', { username: getAllUsers().find(u => u.email === userEmail)?.username || '' }))) {
      const users = getAllUsers().filter(u => u.email !== userEmail);
      localStorage.setItem('budgetUsers', JSON.stringify(users));
      alert(t('userRejected'));
    }
  };

  // Transaction management with user separation
  const getUserTransactionKey = (email) => `budgetTransactions_${email}`;

  const loadUserTransactions = (email) => {
    const key = getUserTransactionKey(email);
    const saved = localStorage.getItem(key);
    const userTransactions = saved ? JSON.parse(saved) : [];
    setTransactions(userTransactions);
  };

  const saveUserTransactions = (email, transactions) => {
    const key = getUserTransactionKey(email);
    localStorage.setItem(key, JSON.stringify(transactions));
  };

  // Load transactions when user changes
  useEffect(() => {
    if (currentUser) {
      const viewingUser = selectedUserData || currentUser;
      loadUserTransactions(viewingUser.email);
    }
  }, [currentUser, selectedUserData]);

  // Save transactions when they change (only if viewing own data)
  useEffect(() => {
    if (currentUser && (!selectedUserData || selectedUserData.email === currentUser.email)) {
      saveUserTransactions(currentUser.email, transactions);
    }
  }, [transactions, currentUser, selectedUserData]);

  // Filter transactions by date range
  const getFilteredTransactions = () => {
    if (!startDate && !endDate) return transactions;
    
    return transactions.filter(transaction => {
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
  const addTransaction = (e) => {
    e.preventDefault();
    
    if (selectedUserData && selectedUserData.email !== currentUser.email) {
      alert(t('canOnlyAdd'));
      return;
    }
    
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      alert(t('validDescription'));
      return;
    }

    const now = new Date();
    const newTransaction = {
      id: Date.now(),
      description: description.trim(),
      amount: parseFloat(amount),
      type: type,
      category: type === 'expense' ? category : t('income'),
      date: now.toLocaleDateString(),
      dateISO: now.toISOString().split('T')[0],
      userId: currentUser.email
    };

    setTransactions([...transactions, newTransaction]);
    setDescription('');
    setAmount('');
    setCategory(t('general'));
  };

  // Edit transaction (only if viewing own data)
  const startEdit = (transaction) => {
    if (selectedUserData && selectedUserData.email !== currentUser.email) {
      alert(t('canOnlyEdit'));
      return;
    }
    
    setEditingTransaction(transaction);
    setEditDescription(transaction.description);
    setEditAmount(transaction.amount.toString());
    setEditType(transaction.type);
    setEditCategory(transaction.category);
  };

  const saveEdit = () => {
    if (!editDescription.trim() || !editAmount || parseFloat(editAmount) <= 0) {
      alert(t('validDescription'));
      return;
    }

    const updatedTransactions = transactions.map(t => 
      t.id === editingTransaction.id 
        ? {
            ...t,
            description: editDescription.trim(),
            amount: parseFloat(editAmount),
            type: editType,
            category: editType === 'expense' ? editCategory : t('income')
          }
        : t
    );

    setTransactions(updatedTransactions);
    setEditingTransaction(null);
    setEditDescription('');
    setEditAmount('');
    setEditType('income');
    setEditCategory(t('general'));
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    setEditDescription('');
    setEditAmount('');
    setEditType('income');
    setEditCategory(t('general'));
  };

  // Delete transaction (only if viewing own data)
  const deleteTransaction = (id) => {
    if (selectedUserData && selectedUserData.email !== currentUser.email) {
      alert(t('canOnlyDelete'));
      return;
    }
    
    if (window.confirm(t('confirmDelete'))) {
      setTransactions(transactions.filter(t => t.id !== id));
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
    const userName = selectedUserData ? selectedUserData.username : currentUser.username;
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
    const userName = selectedUserData ? selectedUserData.username : currentUser.username;
    link.download = `budget-${userName}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Chart data preparation
  const getMonthlyData = () => {
    const monthlyData = {};
    
    transactions.forEach(transaction => {
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

  const switchToUserView = (user) => {
    setSelectedUserData(user);
    setActiveTab('dashboard');
  };

  const switchToOwnView = () => {
    setSelectedUserData(null);
    setActiveTab('dashboard');
  };

  // Login/Signup UI
  if (!isLoggedIn) {
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
                {t('welcome')}, {currentUser.username}! {selectedUserData && t('readOnlyMode', { username: selectedUserData.username })}
                {currentUser.isAdmin && <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-full">{t('admin')}</span>}
              </p>
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
              .filter(user => user.email !== currentUser.email)
              .map(user => (
                <button
                  key={user.email}
                  onClick={() => switchToUserView(user)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedUserData?.email === user.email
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👤</div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.isAdmin && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{t('admin')}</span>}
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Admin Panel */}
        {currentUser.isAdmin && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 {t('adminPanel')}</h2>
            
            {/* Pending Approvals */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">{t('pendingApprovals')}</h3>
              {getPendingUsers().length > 0 ? (
                <div className="space-y-3">
                  {getPendingUsers().map(user => (
                    <div key={user.email} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveUser(user.email)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                        >
                          {t('approve')}
                        </button>
                        <button
                          onClick={() => rejectUser(user.email)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                          {t('reject')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">{t('noPendingApprovals')}</p>
              )}
            </div>

            {/* Approved Users Management */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">{t('approvedUsers')}</h3>
              <div className="space-y-3">
                {getApprovedUsers()
                  .filter(user => user.email !== currentUser.email) // Don't show self
                  .map(user => (
                    <div key={user.email} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.isAdmin && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{t('admin')}</span>}
                      </div>
                      <button
                        onClick={() => removeUser(user.email)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  ))}
              </div>
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
            {(!selectedUserData || selectedUserData.email === currentUser.email) && (
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
            {selectedUserData && selectedUserData.email !== currentUser.email && (
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
                        {(!selectedUserData || selectedUserData.email === currentUser.email) && (
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

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>{t('dataSavedLocally', { count: transactions.length })}</p>
        </div>
      </div>
    </div>
  );
}

export default App;