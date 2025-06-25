import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // State for transactions
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('income'); // 'income' or 'expense'

  // Load transactions from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('budgetTransactions');
    if (saved) {
      setTransactions(JSON.parse(saved));
    }
  }, []);

  // Save transactions to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem('budgetTransactions', JSON.stringify(transactions));
  }, [transactions]);

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Add new transaction
  const addTransaction = (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid description and amount');
      return;
    }

    const newTransaction = {
      id: Date.now(),
      description: description.trim(),
      amount: parseFloat(amount),
      type: type,
      date: new Date().toLocaleDateString()
    };

    setTransactions([...transactions, newTransaction]);
    setDescription('');
    setAmount('');
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 Budget Planner</h1>
          <p className="text-gray-600">Track your income and expenses</p>
        </div>

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

        {/* Add Transaction Form */}
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
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
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
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Add Transaction
              </button>
            </div>
          </form>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <p className="text-gray-500">No transactions yet. Add your first transaction above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice().reverse().map((transaction) => (
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
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => deleteTransaction(transaction.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-all"
                      title="Delete transaction"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Data is saved locally in your browser</p>
        </div>
      </div>
    </div>
  );
}

export default App;