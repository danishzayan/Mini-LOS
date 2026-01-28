'use client';

import { useState, useEffect } from 'react';
import { loanService, authService } from '@/services/loan.service';
import StatusBadge from '@/components/StatusBadge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  LogIn,
  LogOut,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Briefcase,
  IndianRupee,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  const [loans, setLoans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Expanded row state
  const [expandedRow, setExpandedRow] = useState(null);

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    }
  }, []);

  // Fetch user data
  const fetchUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      if (userData.is_admin) {
        fetchData();
      }
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Fetch admin data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [loansData, statsData] = await Promise.all([
        loanService.getAllLoans(),
        loanService.getStats(),
      ]);
      setLoans(loansData);
      setStats(statsData);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    
    try {
      await authService.login(loginForm.email, loginForm.password);
      await fetchUser();
    } catch (err) {
      setLoginError(err.response?.data?.detail || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setLoans([]);
    setStats(null);
  };

  // Pagination calculations
  const totalPages = Math.ceil(loans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = loans.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setExpandedRow(null);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Login Form
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mb-4 shadow-glow">
              <LogIn className="h-8 w-8 text-dark-900" />
            </div>
            <h1 className="text-2xl font-bold text-dark-900">Admin Login</h1>
            <p className="text-dark-500 mt-2">Sign in to access the admin dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Email"
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              placeholder="admin@example.com"
              required
            />
            
            <Input
              label="Password"
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="••••••••"
              required
            />

            {loginError && (
              <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium border border-rose-200">
                {loginError}
              </div>
            )}

            <Button type="submit" loading={isLoggingIn} className="w-full" size="lg">
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Not admin
  if (!user.is_admin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 rounded-full mb-6">
            <AlertTriangle className="h-10 w-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-dark-900 mb-2">Access Denied</h1>
          <p className="text-dark-500 mb-2">You don't have admin privileges.</p>
          <p className="text-sm text-dark-400 mb-6">
            Logged in as: <span className="font-medium text-dark-600">{user.email}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleLogout} variant="secondary" className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Logout & Try Different Account
            </Button>
            <a href="/" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              ← Back to Home
            </a>
          </div>
        </div>
        
        {/* Admin credentials hint */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left">
          <p className="text-amber-800 text-sm font-medium mb-1">💡 Need admin access?</p>
          <p className="text-amber-700 text-xs">
            Contact the system administrator to get admin credentials or have your account upgraded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user.full_name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            onClick={fetchData} 
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.TOTAL || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.DRAFT || 0) + (stats.KYC_PENDING || 0) + (stats.KYC_COMPLETED || 0) + (stats.CREDIT_CHECK_PENDING || 0) + (stats.CREDIT_CHECK_COMPLETED || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Eligible</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ELIGIBLE || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Not Eligible</p>
                <p className="text-2xl font-bold text-gray-900">{stats.NOT_ELIGIBLE || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loans Table */}
      <div className="bg-white rounded-2xl shadow-card border border-dark-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">All Applications</h2>
          <span className="text-sm text-gray-500">{loans.length} total records</span>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No applications yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PAN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employment</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Income</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Loan Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentLoans.map((loan) => (
                    <>
                      <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-semibold text-primary-600">#{loan.id}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <img 
                              src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(loan.full_name)}`}
                              alt={loan.full_name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{loan.full_name}</div>
                              <div className="text-xs text-gray-500">DOB: {new Date(loan.dob).toLocaleDateString('en-IN')}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-900">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {loan.mobile}
                            </div>
                            {loan.email && (
                              <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                                <Mail className="w-3 h-3 text-gray-400" />
                                {loan.email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{loan.pan}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                            loan.employment_type === 'SALARIED' 
                              ? 'bg-blue-100 text-blue-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            <Briefcase className="w-3 h-3" />
                            {loan.employment_type}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            ₹{(loan.monthly_income || 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-gray-500">/month</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-primary-700">
                            ₹{(loan.loan_amount || 0).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <StatusBadge status={loan.status} size="sm" />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(loan.created_at).toLocaleDateString('en-IN')}</div>
                          <div className="text-xs text-gray-500">{new Date(loan.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => setExpandedRow(expandedRow === loan.id ? null : loan.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            {expandedRow === loan.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {/* Expanded Row Details */}
                      {expandedRow === loan.id && (
                        <tr key={`${loan.id}-details`}>
                          <td colSpan={10} className="px-4 py-4 bg-gray-50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase">Full Name</p>
                                <p className="font-medium text-gray-900">{loan.full_name}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase">Mobile</p>
                                <p className="font-medium text-gray-900">{loan.mobile}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase">Email</p>
                                <p className="font-medium text-gray-900">{loan.email || 'N/A'}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase">PAN</p>
                                <p className="font-medium text-gray-900 font-mono">{loan.pan}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase">Date of Birth</p>
                                <p className="font-medium text-gray-900">{new Date(loan.dob).toLocaleDateString('en-IN')}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase">Employment Type</p>
                                <p className="font-medium text-gray-900">{loan.employment_type}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase">Monthly Income</p>
                                <p className="font-medium text-gray-900">₹{(loan.monthly_income || 0).toLocaleString('en-IN')}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase">Loan Amount</p>
                                <p className="font-medium text-primary-700">₹{(loan.loan_amount || 0).toLocaleString('en-IN')}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase">Loan Purpose</p>
                                <p className="font-medium text-gray-900">{loan.loan_purpose || 'Not specified'}</p>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs text-gray-500 uppercase">Status</p>
                                <StatusBadge status={loan.status} size="sm" />
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-gray-200 md:col-span-2">
                                <p className="text-xs text-gray-500 uppercase">Address</p>
                                <p className="font-medium text-gray-900">{loan.address || 'Not provided'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(endIndex, loans.length)} of {loans.length} applications
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary-500 text-dark-900'
                          : 'border border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
