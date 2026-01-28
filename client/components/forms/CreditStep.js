'use client';

import Button from '@/components/common/Button';
import StatusBadge from '@/components/StatusBadge';
import { WORKFLOW_STATES } from '@/utils/constants';
import { CreditCard, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function CreditStep({ loan, onSubmit, loading }) {
  // Backend uses 'status', normalize to handle both
  const status = loan?.status || loan?.workflow_state;
  
  const canRunCreditCheck = status === WORKFLOW_STATES.KYC_COMPLETED;
  const isCreditPending = status === WORKFLOW_STATES.CREDIT_CHECK_PENDING;
  const isCreditCompleted = status === WORKFLOW_STATES.CREDIT_CHECK_COMPLETED ||
    [WORKFLOW_STATES.ELIGIBLE, WORKFLOW_STATES.NOT_ELIGIBLE].includes(status);

  // Backend returns credit_result, not credit_details
  const creditDetails = loan?.credit_result || loan?.credit_details;
  const kycResult = loan?.kyc_result || loan?.kyc_details;

  const getCreditScoreColor = (score) => {
    if (score >= 750) return 'text-emerald-600';
    if (score >= 700) return 'text-emerald-500';
    if (score >= 650) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getCreditScoreLabel = (score) => {
    if (score >= 750) return 'Excellent';
    if (score >= 700) return 'Good';
    if (score >= 650) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-6 md:p-8 transition-all duration-300 hover:shadow-card-hover">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
              <CreditCard className="h-5 w-5 text-dark-900" />
            </div>
            <h2 className="text-xl font-bold text-dark-900">Credit Assessment</h2>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* KYC Summary */}
        {kycResult && (
          <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-emerald-800">KYC Verified Successfully</span>
                <p className="text-sm text-emerald-600">Score: {kycResult.kyc_score || kycResult.score}/100</p>
              </div>
            </div>
          </div>
        )}

        {/* Credit Check Results */}
        {isCreditCompleted && creditDetails && (
          <div className="space-y-6 mb-6">
            {/* Credit Score Hero */}
            <div className="bg-gradient-to-r from-dark-800 to-dark-900 rounded-2xl p-6 text-center">
              <p className="text-dark-400 text-sm uppercase tracking-wide mb-2">Your Credit Score</p>
              <div className="relative inline-block">
                <p className={`text-6xl font-bold ${getCreditScoreColor(creditDetails.credit_score || creditDetails.score)}`}>
                  {creditDetails.credit_score || creditDetails.score}
                </p>
                <span className={`absolute -top-1 -right-16 text-xs font-medium px-2 py-1 rounded-full ${
                  (creditDetails.credit_score || creditDetails.score) >= 700 ? 'bg-emerald-500/20 text-emerald-400' : 
                  (creditDetails.credit_score || creditDetails.score) >= 650 ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {getCreditScoreLabel(creditDetails.credit_score || creditDetails.score)}
                </span>
              </div>
              <div className="mt-4 h-2 bg-dark-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    (creditDetails.credit_score || creditDetails.score) >= 700 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                    (creditDetails.credit_score || creditDetails.score) >= 650 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 
                    'bg-gradient-to-r from-rose-400 to-rose-500'
                  }`}
                  style={{ width: `${((creditDetails.credit_score || creditDetails.score) / 900) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-dark-500 mt-1">
                <span>300</span>
                <span>900</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-dark-50 to-dark-100 rounded-xl p-5 text-center border border-dark-200 hover:shadow-card transition-shadow duration-300">
                <div className="w-12 h-12 mx-auto bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp className="h-6 w-6 text-primary-600" />
                </div>
                <p className="text-xs text-dark-500 uppercase tracking-wide">Credit Score</p>
                <p className={`text-2xl font-bold mt-1 ${getCreditScoreColor(creditDetails.credit_score || creditDetails.score)}`}>
                  {creditDetails.credit_score || creditDetails.score}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-dark-50 to-dark-100 rounded-xl p-5 text-center border border-dark-200 hover:shadow-card transition-shadow duration-300">
                <div className="w-12 h-12 mx-auto bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                  <CreditCard className="h-6 w-6 text-primary-600" />
                </div>
                <p className="text-xs text-dark-500 uppercase tracking-wide">Active Loans</p>
                <p className="text-2xl font-bold text-dark-900 mt-1">
                  {creditDetails.existing_loans || creditDetails.active_loans || 0}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-dark-50 to-dark-100 rounded-xl p-5 text-center border border-dark-200 hover:shadow-card transition-shadow duration-300">
                <div className="w-12 h-12 mx-auto bg-primary-100 rounded-xl flex items-center justify-center mb-3">
                  <span className="text-primary-600 font-bold text-lg">%</span>
                </div>
                <p className="text-xs text-dark-500 uppercase tracking-wide">Debt-to-Income</p>
                <p className={`text-2xl font-bold mt-1 ${
                  (creditDetails.debt_to_income_ratio || creditDetails.dti || 0) <= 0.4 ? 'text-emerald-600' : 
                  (creditDetails.debt_to_income_ratio || creditDetails.dti || 0) <= 0.5 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {((creditDetails.debt_to_income_ratio || creditDetails.dti || 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Defaults Status */}
            <div className={`rounded-xl p-4 border ${creditDetails.has_defaults ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${creditDetails.has_defaults ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                  {creditDetails.has_defaults ? (
                    <AlertCircle className="h-5 w-5 text-white" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <span className={`font-semibold ${creditDetails.has_defaults ? 'text-rose-800' : 'text-emerald-800'}`}>
                    {creditDetails.has_defaults ? 'Previous Defaults Found' : 'No Previous Defaults'}
                  </span>
                  <p className={`text-sm ${creditDetails.has_defaults ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {creditDetails.has_defaults ? 'This may affect your eligibility' : 'Clean credit history'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Credit Check Action */}
        {canRunCreditCheck && (
          <>
            <div className="bg-primary-50 rounded-xl p-5 mb-6 border border-primary-200">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-5 w-5 text-dark-900" />
                </div>
                <div>
                  <h3 className="font-semibold text-dark-900">Credit Bureau Check</h3>
                  <p className="text-sm text-dark-600 mt-1">
                    We will check your credit history with credit bureaus to assess your 
                    loan eligibility. This is a soft inquiry and won't affect your credit score.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={onSubmit}
              loading={loading}
              className="w-full"
              size="lg"
            >
              Run Credit Check
            </Button>
          </>
        )}

        {/* Waiting for Credit Check */}
        {isCreditPending && (
          <div className="text-center py-8">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-dark-600">Processing credit check...</p>
          </div>
        )}
      </div>
    </div>
  );
}
