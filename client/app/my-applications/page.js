'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loanService, authService } from '@/services/loan.service';
import { API_ENDPOINTS } from '@/utils/constants';
import axios from 'axios';
import { 
  FileText, Clock, CheckCircle, XCircle, AlertCircle, 
  Loader2, Edit2, Eye, ArrowRight, Plus, RefreshCw,
  TrendingUp, IndianRupee
} from 'lucide-react';
import Button from '@/components/common/Button';

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    DRAFT: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: FileText },
    KYC_PENDING: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
    KYC_COMPLETED: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
    CREDIT_CHECK_PENDING: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: Clock },
    CREDIT_CHECK_COMPLETED: { color: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: CheckCircle },
    ELIGIBLE: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
    NOT_ELIGIBLE: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.DRAFT;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

// Stat card component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className={`bg-white rounded-xl shadow-card border border-dark-100 p-5 hover:shadow-card-hover transition-all`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

// Edit Modal Component
const EditModal = ({ loan, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    full_name: loan?.full_name || '',
    mobile: loan?.mobile || '',
    email: loan?.email || '',
    address: loan?.address || '',
    employment_type: loan?.employment_type || 'SALARIED',
    monthly_income: loan?.monthly_income || '',
    loan_amount: loan?.loan_amount || '',
    loan_purpose: loan?.loan_purpose || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Required';
    else if (!/^[6-9]\d{9}$/.test(formData.mobile)) newErrors.mobile = 'Invalid phone';
    if (!formData.monthly_income || parseFloat(formData.monthly_income) <= 0) 
      newErrors.monthly_income = 'Required';
    if (!formData.loan_amount || parseFloat(formData.loan_amount) <= 0) 
      newErrors.loan_amount = 'Required';
    else if (parseFloat(formData.loan_amount) > parseFloat(formData.monthly_income) * 20) 
      newErrors.loan_amount = 'Cannot exceed 20x income';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      await onSave(loan.id, {
        full_name: formData.full_name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address || null,
        employment_type: formData.employment_type,
        monthly_income: parseFloat(formData.monthly_income),
        loan_amount: parseFloat(formData.loan_amount),
        loan_purpose: formData.loan_purpose || null,
      });
      onClose();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Edit2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Edit Application</h2>
              <p className="text-sm text-white/80">Application #{loan?.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-light">×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.full_name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                maxLength={10}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.mobile ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="SALARIED">Salaried</option>
                <option value="SELF_EMPLOYED">Self Employed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (₹) *</label>
              <input
                name="monthly_income"
                type="number"
                value={formData.monthly_income}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.monthly_income ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.monthly_income && <p className="text-red-500 text-xs mt-1">{errors.monthly_income}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (₹) *</label>
              <input
                name="loan_amount"
                type="number"
                value={formData.loan_amount}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${errors.loan_amount ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.loan_amount && <p className="text-red-500 text-xs mt-1">{errors.loan_amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loan Purpose</label>
              <input
                name="loan_purpose"
                value={formData.loan_purpose}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-dark-900 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLoan, setEditingLoan] = useState(null);

  // Fetch user and loans
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth?redirect=/my-applications');
        return;
      }

      try {
        const [userData, loansData] = await Promise.all([
          authService.getMe(),
          loanService.getMyLoans()
        ]);
        setUser(userData);
        setLoans(loansData);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          router.push('/auth?redirect=/my-applications');
        } else {
          setError(err.message || 'Failed to load data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Calculate stats
  const stats = {
    total: loans.length,
    draft: loans.filter(l => l.status === 'DRAFT').length,
    pending: loans.filter(l => ['KYC_PENDING', 'CREDIT_CHECK_PENDING'].includes(l.status)).length,
    inProgress: loans.filter(l => ['KYC_COMPLETED', 'CREDIT_CHECK_COMPLETED'].includes(l.status)).length,
    eligible: loans.filter(l => l.status === 'ELIGIBLE').length,
    notEligible: loans.filter(l => l.status === 'NOT_ELIGIBLE').length,
    activeLoans: loans.filter(l => !['ELIGIBLE', 'NOT_ELIGIBLE'].includes(l.status)).length,
  };

  // Handle update
  const handleUpdate = async (id, data) => {
    const updated = await loanService.updateLoan(id, data);
    setLoans(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
  };

  // Continue application
  const handleContinue = (loan) => {
    // Store loan ID and redirect to apply page to continue
    localStorage.setItem('continueLoanId', loan.id);
    router.push(`/loan/apply?continue=${loan.id}`);
  };


  // Loan Details Modal state
  const [viewingLoan, setViewingLoan] = useState(null);
  const [viewingLoanLoading, setViewingLoanLoading] = useState(false);
  const [viewingLoanError, setViewingLoanError] = useState(null);

  // View details handler (fetches latest loan details)
  const handleView = async (loan) => {
    setViewingLoanLoading(true);
    setViewingLoanError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(API_ENDPOINTS.GET_LOAN(loan.id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViewingLoan(res.data);
    } catch (err) {
      setViewingLoanError(err.message || 'Failed to load details');
      setViewingLoan(null);
    } finally {
      setViewingLoanLoading(false);
    }
  };
// Loan Details Modal
const LoanDetailsModal = ({ loan, onClose, loading, error }) => {
  if (!loan && !loading) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-white">Application Details</h2>
            <p className="text-sm text-white/80">Application #{loan?.id}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl font-light">×</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-primary-600 font-semibold">Loading details...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 font-semibold">{error}</div>
          ) : (
            <>
              <h3 className="font-bold text-dark-900 mb-2">Applicant Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div><span className="text-xs text-gray-500">Full Name</span><div className="font-medium">{loan.full_name}</div></div>
                <div><span className="text-xs text-gray-500">Mobile</span><div className="font-medium">{loan.mobile}</div></div>
                <div><span className="text-xs text-gray-500">PAN</span><div className="font-medium">{loan.pan}</div></div>
                <div><span className="text-xs text-gray-500">DOB</span><div className="font-medium">{loan.dob}</div></div>
                <div><span className="text-xs text-gray-500">Email</span><div className="font-medium">{loan.email}</div></div>
                <div><span className="text-xs text-gray-500">Employment Type</span><div className="font-medium">{loan.employment_type}</div></div>
                <div><span className="text-xs text-gray-500">Monthly Income</span><div className="font-medium">₹{loan.monthly_income?.toLocaleString()}</div></div>
                <div><span className="text-xs text-gray-500">Loan Amount</span><div className="font-medium">₹{loan.loan_amount?.toLocaleString()}</div></div>
                <div className="md:col-span-2"><span className="text-xs text-gray-500">Address</span><div className="font-medium">{loan.address || '-'}</div></div>
              </div>
              <h3 className="font-bold text-dark-900 mb-2">KYC Result</h3>
              {loan.kyc_result ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div><span className="text-xs text-gray-500">Status</span><div className="font-medium">{loan.kyc_result.status}</div></div>
                  <div><span className="text-xs text-gray-500">Name Match Score</span><div className="font-medium">{loan.kyc_result.name_match_score}</div></div>
                  <div><span className="text-xs text-gray-500">PAN Verified</span><div className="font-medium">{loan.kyc_result.pan_verified}</div></div>
                  <div><span className="text-xs text-gray-500">Address Verified</span><div className="font-medium">{loan.kyc_result.address_verified}</div></div>
                  <div className="md:col-span-2"><span className="text-xs text-gray-500">Checked At</span><div className="font-medium">{loan.kyc_result.created_at ? new Date(loan.kyc_result.created_at).toLocaleString() : '-'}</div></div>
                </div>
              ) : <div className="mb-6 text-gray-500">No KYC result</div>}
              <h3 className="font-bold text-dark-900 mb-2">Credit Result</h3>
              {loan.credit_result ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                  <div><span className="text-xs text-gray-500">Credit Score</span><div className="font-medium">{loan.credit_result.credit_score}</div></div>
                  <div><span className="text-xs text-gray-500">Active Loans</span><div className="font-medium">{loan.credit_result.active_loans}</div></div>
                  <div><span className="text-xs text-gray-500">Approved</span><div className="font-medium">{loan.credit_result.is_approved ? 'Yes' : 'No'}</div></div>
                  <div className="md:col-span-2"><span className="text-xs text-gray-500">Rejection Reason</span><div className="font-medium">{loan.credit_result.rejection_reason || '-'}</div></div>
                  <div className="md:col-span-2"><span className="text-xs text-gray-500">Checked At</span><div className="font-medium">{loan.credit_result.created_at ? new Date(loan.credit_result.created_at).toLocaleString() : '-'}</div></div>
                </div>
              ) : <div className="mb-2 text-gray-500">No credit result</div>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    try {
      const loansData = await loanService.getMyLoans();
      setLoans(loansData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-dark-500">Loading your applications...</p>
        </div>
      </div>
    );
  }

  const canApply = stats.activeLoans < 5;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, <span className="font-semibold text-primary-600">{user?.full_name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Button
            onClick={() => {
              if (canApply) {
                router.push('/loan/apply');
              }
            }}
            disabled={!canApply}
            className={!canApply ? 'opacity-50 cursor-not-allowed' : ''}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Application
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total"
          value={stats.total}
          icon={FileText}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Draft"
          value={stats.draft}
          icon={Edit2}
          color="bg-orange-100 text-orange-600"
          subtitle="Can edit"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={TrendingUp}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="Eligible"
          value={stats.eligible}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Not Eligible"
          value={stats.notEligible}
          icon={XCircle}
          color="bg-red-100 text-red-600"
        />
      </div>

      {/* Active Loans Warning */}
      {stats.activeLoans >= 5 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>You have reached the maximum of 5 active loan applications. Complete or wait for existing applications to proceed.</p>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-card border border-dark-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Your Applications</h2>
        </div>

        {loans.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-6">Start your loan journey by creating a new application.</p>
            <Button
              onClick={() => {
                if (canApply) {
                  router.push('/loan/apply');
                }
              }}
              disabled={!canApply}
              className={!canApply ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Plus className="w-4 h-4 mr-2" />
              Apply for Loan
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PAN</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">#{loan.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 font-mono">{loan.pan}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                        {loan.loan_amount?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={loan.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(loan.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {loan.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => setEditingLoan(loan)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleContinue(loan)}
                              className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-dark-900 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                            >
                              Continue
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {loan.status !== 'DRAFT' && (
                          <button
                            onClick={() => handleView(loan)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {['KYC_PENDING', 'KYC_COMPLETED', 'CREDIT_CHECK_PENDING'].includes(loan.status) && (
                          <button
                            onClick={() => handleContinue(loan)}
                            className="px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-dark-900 text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                          >
                            Continue
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingLoan && (
        <EditModal
          loan={editingLoan}
          onClose={() => setEditingLoan(null)}
          onSave={handleUpdate}
        />
      )}

      {/* Loan Details Modal */}
      {(viewingLoan || viewingLoanLoading || viewingLoanError) && (
        <LoanDetailsModal
          loan={viewingLoan}
          loading={viewingLoanLoading}
          error={viewingLoanError}
          onClose={() => { setViewingLoan(null); setViewingLoanError(null); }}
        />
      )}
    </div>
  );
}
