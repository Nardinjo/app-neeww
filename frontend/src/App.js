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

function App() {
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
    'Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 
    'Healthcare', 'Education', 'Travel', 'General'
  ];

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
      alert('Please fill all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    const users = getAllUsers();
    if (users.some(user => user.email === email)) {
      alert('Email already registered');
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
      alert('Admin account created and approved!');
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } else {
      alert('Account created! Please wait for admin approval.');
    }
    
    setSignupData({ username: '', email: '', password: '', confirmPassword: '' });
    setShowLogin(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password } = loginData;
    
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    
    const users = getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      alert('Invalid email or password');
      return;
    }
    
    if (!user.isApproved && email !== ADMIN_EMAIL) {
      alert('Your account is pending admin approval');
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
      alert(`User ${user.username} has been approved!`);
    }
  };

  const rejectUser = (userEmail) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      const users = getAllUsers().filter(u => u.email !== userEmail);
      localStorage.setItem('budgetUsers', JSON.stringify(users));
      alert('User rejected and removed');
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
      alert('You can only add transactions to your own budget');
      return;
    }
    
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid description and amount');
      return;
    }

    const now = new Date();
    const newTransaction = {
      id: Date.now(),
      description: description.trim(),
      amount: parseFloat(amount),
      type: type,
      category: type === 'expense' ? category : 'Income',
      date: now.toLocaleDateString(),
      dateISO: now.toISOString().split('T')[0],
      userId: currentUser.email
    };

    setTransactions([...transactions, newTransaction]);
    setDescription('');
    setAmount('');
    setCategory('General');
  };

  // Edit transaction (only if viewing own data)
  const startEdit = (transaction) => {
    if (selectedUserData && selectedUserData.email !== currentUser.email) {
      alert('You can only edit your own transactions');
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
      alert('Please enter a valid description and amount');
      return;
    }

    const updatedTransactions = transactions.map(t => 
      t.id === editingTransaction.id 
        ? {
            ...t,
            description: editDescription.trim(),
            amount: parseFloat(editAmount),
            type: editType,
            category: editType === 'expense' ? editCategory : 'Income'
          }
        : t
    );

    setTransactions(updatedTransactions);
    setEditingTransaction(null);
    setEditDescription('');
    setEditAmount('');
    setEditType('income');
    setEditCategory('General');
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    setEditDescription('');
    setEditAmount('');
    setEditType('income');
    setEditCategory('General');
  };

  // Delete transaction (only if viewing own data)
  const deleteTransaction = (id) => {
    if (selectedUserData && selectedUserData.email !== currentUser.email) {
      alert('You can only delete your own transactions');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  // Export data
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Category', 'Amount'];
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
          label: 'Income',
          data: last6Months.map(month => monthlyData[month].income),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2
        },
        {
          label: 'Expenses',
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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">💰 Budget Planner Pro</h1>
            <p className="text-gray-600">Manage your finances together</p>
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
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-all ${
                !showLogin 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {showLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={signupData.username}
                  onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Choose a username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Create a password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Sign Up
              </button>
              <p className="text-xs text-gray-500 text-center">
                New accounts require admin approval (except leonard.lamaj@gmail.com)
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
                💰 Budget Planner Pro
              </h1>
              <p className="text-gray-600">
                Welcome, {currentUser.username}! {selectedUserData && `(Viewing ${selectedUserData.username}'s budget)`}
                {currentUser.isAdmin && <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 text-xs rounded-full">Admin</span>}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {selectedUserData && (
                <button
                  onClick={switchToOwnView}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                >
                  My Budget
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* User Selection for All Users */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 View Other Users' Budgets</h2>
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
                    {user.isAdmin && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Admin</span>}
                  </div>
                </button>
              ))}
          </div>
        </div>

        {/* Admin Panel */}
        {currentUser.isAdmin && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🔧 Admin Panel</h2>
            {getPendingUsers().length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Pending Approvals:</h3>
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
                        Approve
                      </button>
                      <button
                        onClick={() => rejectUser(user.email)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No pending approvals</p>
            )}
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
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'charts'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📈 Charts
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'transactions'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📋 Transactions
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
                    <p className="text-green-600 text-sm font-medium">Total Income</p>
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
                    <p className="text-red-600 text-sm font-medium">Total Expenses</p>
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
                    <p className={`${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'} text-sm font-medium`}>Net Balance</p>
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Transaction</h2>
                <form onSubmit={addTransaction} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="income">💰 Income</option>
                        <option value="expense">💸 Expense</option>
                      </select>
                    </div>
                    {type === 'expense' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
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
                      Add Transaction
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Read-only message for viewing others' data */}
            {selectedUserData && selectedUserData.email !== currentUser.email && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 text-center">
                <p className="text-blue-800">👀 You are viewing {selectedUserData.username}'s budget (read-only)</p>
              </div>
            )}
          </>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="space-y-8">
            {/* Monthly Trends Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">📈 Monthly Trends</h2>
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
                        text: 'Income vs Expenses (Last 6 Months)'
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
                <h2 className="text-xl font-semibold text-gray-800 mb-4">🍰 Expense Categories</h2>
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
                          text: 'Spending by Category'
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
                    📅 Date Filter
                  </button>
                  
                  {(startDate || endDate) && (
                    <button
                      onClick={clearDateFilter}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportToCSV}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                  >
                    📊 Export CSV
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all"
                  >
                    📄 Export JSON
                  </button>
                </div>
              </div>

              {/* Date Filter */}
              {showDateFilter && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
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
                📋 Transactions {(startDate || endDate) && `(${filteredTransactions.length} filtered)`}
              </h2>
              
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <p className="text-gray-500">No transactions found for the selected criteria.</p>
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
                              title="Edit transaction"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteTransaction(transaction.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-all"
                              title="Delete transaction"
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4">✏️ Edit Transaction</h2>
              <form onSubmit={(e) => { e.preventDefault(); saveEdit(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="income">💰 Income</option>
                    <option value="expense">💸 Expense</option>
                  </select>
                </div>
                {editType === 'expense' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Multi-user budget management • {transactions.length} transactions • Data saved locally</p>
        </div>
      </div>
    </div>
  );
}

export default App;