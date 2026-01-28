'use client';

import { useState, useEffect } from 'react';
import { loanService, authService } from '@/services/loan.service';
import StatusBadge from '@/components/StatusBadge';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { WORKFLOW_STATES } from '@/utils/constants';
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
  ChevronUp,
  Filter,
  X,
  MapPin,
  User,
  ArrowRight,
  History,
  Edit,
  RotateCcw,
  Save
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
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [eligibilityFilter, setEligibilityFilter] = useState('ALL'); // ALL, ELIGIBLE, NOT_ELIGIBLE
  const [showFilters, setShowFilters] = useState(false);
  
  // Journey modal state
  const [journeyModal, setJourneyModal] = useState({ open: false, loan: null });
  
  // Edit modal state
  const [editModal, setEditModal] = useState({ open: false, loan: null });
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  
  // Retry KYC state
  const [retryingKyc, setRetryingKyc] = useState(null);

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

  // Filter loans
  const filteredLoans = loans.filter(loan => {
    // Status filter
    if (statusFilter !== 'ALL' && loan.status !== statusFilter) {
      return false;
    }
    // Eligibility filter
    if (eligibilityFilter === 'ELIGIBLE' && loan.status !== WORKFLOW_STATES.ELIGIBLE) {
      return false;
    }
    if (eligibilityFilter === 'NOT_ELIGIBLE' && loan.status !== WORKFLOW_STATES.NOT_ELIGIBLE) {
      return false;
    }
    if (eligibilityFilter === 'PENDING' && 
        (loan.status === WORKFLOW_STATES.ELIGIBLE || loan.status === WORKFLOW_STATES.NOT_ELIGIBLE)) {
      return false;
    }
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLoans = filteredLoans.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setExpandedRow(null);
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter('ALL');
    setEligibilityFilter('ALL');
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'ALL' || eligibilityFilter !== 'ALL';

  // View journey for a loan using the history API
  const viewJourney = async (loan) => {
    try {
      // Use the admin history API for complete journey data
      const history = await loanService.getHistory(loan.id);
      console.log('History API response:', history);
      // Transform history response to match journey modal expectations
      const journeyData = {
        ...history.application,
        kyc_result: history.kyc,
        credit_result: history.credit,
        eligibility_result: history.eligibility
      };
      console.log('Journey data:', journeyData);
      setJourneyModal({ open: true, loan: journeyData });
    } catch (err) {
      console.error('Failed to fetch loan history:', err);
      // Fallback to regular loan fetch
      try {
        const detailedLoan = await loanService.getLoan(loan.id);
        console.log('Fallback loan data:', detailedLoan);
        setJourneyModal({ open: true, loan: detailedLoan });
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
        // Ultimate fallback to basic loan data
        setJourneyModal({ open: true, loan });
      }
    }
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

  // Open edit modal
  const openEditModal = (loan) => {
    setEditForm({
      full_name: loan.full_name || '',
      email: loan.email || '',
      mobile: loan.mobile || '',
      dob: loan.dob ? loan.dob.split('T')[0] : '',
      pan: loan.pan || '',
      address: loan.address || '',
      employment_type: loan.employment_type || 'SALARIED',
      monthly_income: loan.monthly_income || '',
      loan_amount: loan.loan_amount || '',
      loan_purpose: loan.loan_purpose || ''
    });
    setEditError('');
    setEditModal({ open: true, loan });
  };

  // Handle edit form submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editModal.loan) return;
    
    setEditLoading(true);
    setEditError('');
    
    try {
      await loanService.updateLoan(editModal.loan.id, {
        ...editForm,
        monthly_income: parseFloat(editForm.monthly_income),
        loan_amount: parseFloat(editForm.loan_amount)
      });
      
      setEditModal({ open: false, loan: null });
      fetchData(); // Refresh the data
    } catch (err) {
      setEditError(err.response?.data?.detail || 'Failed to update application');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle KYC retry
  const handleRetryKyc = async (loanId) => {
    setRetryingKyc(loanId);
    try {
      await loanService.retryKYC(loanId);
      fetchData(); // Refresh the data
    } catch (err) {
      console.error('Failed to retry KYC:', err);
      alert(err.response?.data?.detail || 'Failed to retry KYC');
    } finally {
      setRetryingKyc(null);
    }
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

      {/* Journey Modal */}
      {journeyModal.open && journeyModal.loan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-primary-50 to-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-100 rounded-xl shadow-sm">
                  <History className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Application Journey</h3>
                  <p className="text-sm text-gray-500">#{journeyModal.loan.id} • {journeyModal.loan.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setJourneyModal({ open: false, loan: null })}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Timeline */}
              <div className="relative">
                {/* Application Created */}
                <div className="flex gap-4 pb-8">
                  <div className="flex flex-col items-center">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="w-0.5 h-full bg-gradient-to-b from-blue-200 to-gray-200 mt-2"></div>
                  </div>
                  <div className="flex-1 pb-2">
                    <h4 className="font-semibold text-gray-900">Application Submitted</h4>
                    <p className="text-sm text-gray-500 mt-1">{formatDate(journeyModal.loan.created_at)}</p>
                    <div className="mt-3 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-sm border border-gray-100 shadow-sm">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Amount</span>
                          <span className="font-semibold text-gray-900">₹{(journeyModal.loan.loan_amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Purpose</span>
                          <span className="font-semibold text-gray-900">{journeyModal.loan.loan_purpose || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Employment</span>
                          <span className="font-semibold text-gray-900">{journeyModal.loan.employment_type}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-400 uppercase tracking-wide">Income</span>
                          <span className="font-semibold text-gray-900">₹{(journeyModal.loan.monthly_income || 0).toLocaleString('en-IN')}/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KYC Verification */}
                <div className="flex gap-4 pb-8">
                  <div className="flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white ${
                      journeyModal.loan.kyc_result 
                        ? journeyModal.loan.kyc_result.status === 'PASSED' 
                          ? 'bg-gradient-to-br from-green-100 to-green-200' 
                          : 'bg-gradient-to-br from-red-100 to-red-200'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <User className={`w-5 h-5 ${
                        journeyModal.loan.kyc_result 
                          ? journeyModal.loan.kyc_result.status === 'PASSED' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className={`w-0.5 h-full mt-2 ${
                      journeyModal.loan.kyc_result 
                        ? journeyModal.loan.kyc_result.status === 'PASSED' 
                          ? 'bg-gradient-to-b from-green-200 to-gray-200' 
                          : 'bg-gradient-to-b from-red-200 to-gray-200'
                        : 'bg-gray-200'
                    }`}></div>
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">KYC Verification</h4>
                      {journeyModal.loan.kyc_result && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          journeyModal.loan.kyc_result.status === 'PASSED' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {journeyModal.loan.kyc_result.status}
                        </span>
                      )}
                    </div>
                    {journeyModal.loan.kyc_result ? (
                      <>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(journeyModal.loan.kyc_result.created_at)}</p>
                        <div className="mt-3 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-sm border border-gray-100 shadow-sm">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100">
                              <span className="text-xs text-gray-400 uppercase tracking-wide">Name Match</span>
                              <span className="font-bold text-lg text-gray-900">{journeyModal.loan.kyc_result.name_match_score}<span className="text-xs text-gray-400">/100</span></span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100">
                              <span className="text-xs text-gray-400 uppercase tracking-wide">PAN Verified</span>
                              <span className={`font-bold text-lg ${journeyModal.loan.kyc_result.pan_verified === 'YES' ? 'text-green-600' : 'text-red-600'}`}>{journeyModal.loan.kyc_result.pan_verified}</span>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-white rounded-lg border border-gray-100">
                              <span className="text-xs text-gray-400 uppercase tracking-wide">Address</span>
                              <span className={`font-bold text-lg ${journeyModal.loan.kyc_result.address_verified === 'YES' ? 'text-green-600' : 'text-red-600'}`}>{journeyModal.loan.kyc_result.address_verified}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 mt-2 italic bg-gray-50 px-3 py-2 rounded-lg">⏳ Pending verification</p>
                    )}
                  </div>
                </div>

                {/* Credit Check */}
                <div className="flex gap-4 pb-8">
                  <div className="flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white ${
                      journeyModal.loan.credit_result 
                        ? journeyModal.loan.credit_result.is_approved 
                          ? 'bg-gradient-to-br from-green-100 to-green-200' 
                          : 'bg-gradient-to-br from-red-100 to-red-200'
                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      <CreditCard className={`w-5 h-5 ${
                        journeyModal.loan.credit_result 
                          ? journeyModal.loan.credit_result.is_approved 
                            ? 'text-green-600' 
                            : 'text-red-600'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <div className={`w-0.5 h-full mt-2 ${
                      journeyModal.loan.credit_result 
                        ? journeyModal.loan.credit_result.is_approved 
                          ? 'bg-gradient-to-b from-green-200 to-gray-200' 
                          : 'bg-gradient-to-b from-red-200 to-gray-200'
                        : 'bg-gray-200'
                    }`}></div>
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">Credit Check</h4>
                      {journeyModal.loan.credit_result && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          journeyModal.loan.credit_result.is_approved 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {journeyModal.loan.credit_result.is_approved ? 'APPROVED' : 'REJECTED'}
                        </span>
                      )}
                    </div>
                    {journeyModal.loan.credit_result ? (
                      <>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(journeyModal.loan.credit_result.created_at)}</p>
                        <div className="mt-3 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 text-sm border border-gray-100 shadow-sm">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-100">
                              <span className="text-xs text-gray-400 uppercase tracking-wide">Credit Score</span>
                              <span className={`font-bold text-2xl ${journeyModal.loan.credit_result.credit_score >= 650 ? 'text-green-600' : 'text-red-600'}`}>{journeyModal.loan.credit_result.credit_score}</span>
                            </div>
                            <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-100">
                              <span className="text-xs text-gray-400 uppercase tracking-wide">Active Loans</span>
                              <span className="font-bold text-2xl text-gray-900">{journeyModal.loan.credit_result.active_loans}</span>
                            </div>
                          </div>
                          {journeyModal.loan.credit_result.rejection_reason && (
                            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                              <span className="text-xs text-red-500 uppercase tracking-wide">Rejection Reason</span>
                              <p className="font-medium text-red-700 mt-1">{journeyModal.loan.credit_result.rejection_reason}</p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 mt-2 italic bg-gray-50 px-3 py-2 rounded-lg">⏳ Pending credit check</p>
                    )}
                  </div>
                </div>

                {/* Final Result */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white ${
                      journeyModal.loan.status === WORKFLOW_STATES.ELIGIBLE 
                        ? 'bg-gradient-to-br from-green-400 to-green-500' 
                        : journeyModal.loan.status === WORKFLOW_STATES.NOT_ELIGIBLE
                          ? 'bg-gradient-to-br from-red-400 to-red-500'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200'
                    }`}>
                      {journeyModal.loan.status === WORKFLOW_STATES.ELIGIBLE ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : journeyModal.loan.status === WORKFLOW_STATES.NOT_ELIGIBLE ? (
                        <XCircle className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">Final Decision</h4>
                      <StatusBadge status={journeyModal.loan.status} size="sm" />
                    </div>
                    {journeyModal.loan.eligibility_result ? (
                      <>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(journeyModal.loan.eligibility_result.created_at)}</p>
                        <div className="mt-3 text-sm">
                          {journeyModal.loan.eligibility_result.is_eligible ? (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col p-3 bg-white/80 rounded-lg">
                                  <span className="text-xs text-green-600 uppercase tracking-wide font-medium">Eligible Amount</span>
                                  <span className="font-bold text-xl text-green-700">₹{(journeyModal.loan.eligibility_result.eligible_amount || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex flex-col p-3 bg-white/80 rounded-lg">
                                  <span className="text-xs text-green-600 uppercase tracking-wide font-medium">Interest Rate</span>
                                  <span className="font-bold text-xl text-green-700">{((journeyModal.loan.eligibility_result.interest_rate || 0) * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex flex-col p-3 bg-white/80 rounded-lg">
                                  <span className="text-xs text-green-600 uppercase tracking-wide font-medium">Tenure</span>
                                  <span className="font-bold text-xl text-green-700">{journeyModal.loan.eligibility_result.tenure_months} <span className="text-sm font-normal">months</span></span>
                                </div>
                                <div className="flex flex-col p-3 bg-white/80 rounded-lg">
                                  <span className="text-xs text-green-600 uppercase tracking-wide font-medium">Max EMI</span>
                                  <span className="font-bold text-xl text-green-700">₹{(journeyModal.loan.eligibility_result.max_emi || 0).toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-200 shadow-sm">
                              <span className="text-xs text-red-600 uppercase tracking-wide font-medium">Rejection Reasons</span>
                              <ul className="mt-2 space-y-1">
                                {(journeyModal.loan.eligibility_result.rejection_reasons || '').split('; ').filter(r => r).map((reason, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-red-700">
                                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{reason}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 mt-2 italic bg-gray-50 px-3 py-2 rounded-lg">⏳ Awaiting final decision</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fixed Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end rounded-b-2xl">
              <Button variant="secondary" onClick={() => setJourneyModal({ open: false, loan: null })}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal - Only for DRAFT applications */}
      {editModal.open && editModal.loan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="flex-shrink-0 bg-gradient-to-r from-amber-50 to-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 rounded-xl shadow-sm">
                  <Edit className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Edit Application</h3>
                  <p className="text-sm text-gray-500">#{editModal.loan.id} • {editModal.loan.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditModal({ open: false, loan: null })}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Scrollable Form Content */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {editError && (
                <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm font-medium border border-rose-200">
                  {editError}
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                    <input
                      type="tel"
                      value={editForm.mobile}
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={editForm.dob}
                      onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                    <input
                      type="text"
                      value={editForm.pan}
                      onChange={(e) => setEditForm({ ...editForm, pan: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono transition-all"
                      pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                      placeholder="ABCDE1234F"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Employment & Income */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Employment & Income</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                    <select
                      value={editForm.employment_type}
                      onChange={(e) => setEditForm({ ...editForm, employment_type: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    >
                      <option value="SALARIED">Salaried</option>
                      <option value="SELF_EMPLOYED">Self Employed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹)</label>
                    <input
                      type="number"
                      value={editForm.monthly_income}
                      onChange={(e) => setEditForm({ ...editForm, monthly_income: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      min="0"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Loan Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹)</label>
                    <input
                      type="number"
                      value={editForm.loan_amount}
                      onChange={(e) => setEditForm({ ...editForm, loan_amount: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loan Purpose</label>
                    <input
                      type="text"
                      value={editForm.loan_purpose}
                      onChange={(e) => setEditForm({ ...editForm, loan_purpose: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      placeholder="e.g., Home Renovation, Medical, etc."
                    />
                  </div>
                </div>
              </div>
            </form>
            
            {/* Fixed Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setEditModal({ open: false, loan: null })}
              >
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} loading={editLoading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Loans Table */}
      <div className="bg-white rounded-2xl shadow-card border border-dark-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">All Applications</h2>
              <span className="text-sm text-gray-500">
                {filteredLoans.length} of {loans.length} records
                {hasActiveFilters && ' (filtered)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  showFilters || hasActiveFilters
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                )}
              </button>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 px-2 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value={WORKFLOW_STATES.DRAFT}>Draft</option>
                    <option value={WORKFLOW_STATES.KYC_PENDING}>KYC Pending</option>
                    <option value={WORKFLOW_STATES.KYC_COMPLETED}>KYC Completed</option>
                    <option value={WORKFLOW_STATES.CREDIT_CHECK_PENDING}>Credit Check Pending</option>
                    <option value={WORKFLOW_STATES.CREDIT_CHECK_COMPLETED}>Credit Check Completed</option>
                    <option value={WORKFLOW_STATES.ELIGIBLE}>Eligible</option>
                    <option value={WORKFLOW_STATES.NOT_ELIGIBLE}>Not Eligible</option>
                  </select>
                </div>
                
                {/* Eligibility Quick Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filter</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEligibilityFilter('ALL'); setStatusFilter('ALL'); setCurrentPage(1); }}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        eligibilityFilter === 'ALL' && statusFilter === 'ALL'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => { setEligibilityFilter('PENDING'); setStatusFilter('ALL'); setCurrentPage(1); }}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        eligibilityFilter === 'PENDING'
                          ? 'bg-yellow-500 text-white border-yellow-500'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => { setEligibilityFilter('ELIGIBLE'); setStatusFilter('ALL'); setCurrentPage(1); }}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        eligibilityFilter === 'ELIGIBLE'
                          ? 'bg-green-500 text-white border-green-500'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Eligible
                    </button>
                    <button
                      onClick={() => { setEligibilityFilter('NOT_ELIGIBLE'); setStatusFilter('ALL'); setCurrentPage(1); }}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        eligibilityFilter === 'NOT_ELIGIBLE'
                          ? 'bg-red-500 text-white border-red-500'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Not Eligible
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
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
                          <div className="flex items-center justify-center gap-1">
                            {/* Edit button - only for DRAFT status */}
                            {loan.status === WORKFLOW_STATES.DRAFT && (
                              <button
                                onClick={() => openEditModal(loan)}
                                className="p-2 hover:bg-amber-50 rounded-lg transition-colors group"
                                title="Edit Application"
                              >
                                <Edit className="w-4 h-4 text-gray-400 group-hover:text-amber-600" />
                              </button>
                            )}
                            {/* Retry KYC button - only for NOT_ELIGIBLE with failed KYC */}
                            {loan.status === WORKFLOW_STATES.NOT_ELIGIBLE && (
                              <button
                                onClick={() => handleRetryKyc(loan.id)}
                                disabled={retryingKyc === loan.id}
                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors group disabled:opacity-50"
                                title="Retry KYC"
                              >
                                <RotateCcw className={`w-4 h-4 text-gray-400 group-hover:text-blue-600 ${retryingKyc === loan.id ? 'animate-spin' : ''}`} />
                              </button>
                            )}
                            <button
                              onClick={() => viewJourney(loan)}
                              className="p-2 hover:bg-primary-50 rounded-lg transition-colors group"
                              title="View Journey"
                            >
                              <History className="w-4 h-4 text-gray-400 group-hover:text-primary-600" />
                            </button>
                            <button
                              onClick={() => setExpandedRow(expandedRow === loan.id ? null : loan.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Show Details"
                            >
                              {expandedRow === loan.id ? (
                                <ChevronUp className="w-4 h-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          </div>
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
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredLoans.length)} of {filteredLoans.length} applications
                  {hasActiveFilters && ` (filtered from ${loans.length})`}
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
