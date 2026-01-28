'use client';

import Button from '@/components/common/Button';
import StatusBadge from '@/components/StatusBadge';
import { WORKFLOW_STATES } from '@/utils/constants';
import { CreditCard, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

export default function CreditStep({ loan, onSubmit, loading }) {
  const canRunCreditCheck = loan?.workflow_state === WORKFLOW_STATES.KYC_COMPLETED;
  const isCreditPending = loan?.workflow_state === WORKFLOW_STATES.CREDIT_CHECK_PENDING;
  const isCreditCompleted = loan?.workflow_state === WORKFLOW_STATES.CREDIT_CHECK_COMPLETED ||
    [WORKFLOW_STATES.ELIGIBLE, WORKFLOW_STATES.NOT_ELIGIBLE].includes(loan?.workflow_state);

  const creditDetails = loan?.credit_details;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Credit Assessment</h2>
          <StatusBadge status={loan?.workflow_state} />
        </div>

        {/* KYC Summary */}
        {loan?.kyc_details && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">KYC Verified Successfully</span>
            </div>
          </div>
        )}

        {/* Credit Check Results */}
        {isCreditCompleted && creditDetails && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto text-primary-600 mb-2" />
                <p className="text-sm text-gray-500">Credit Score</p>
                <p className={`text-2xl font-bold ${
                  creditDetails.credit_score >= 700 ? 'text-green-600' :
                  creditDetails.credit_score >= 650 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {creditDetails.credit_score}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <CreditCard className="h-8 w-8 mx-auto text-primary-600 mb-2" />
                <p className="text-sm text-gray-500">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {creditDetails.existing_loans}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="h-8 w-8 mx-auto bg-primary-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-primary-600 font-bold">%</span>
                </div>
                <p className="text-sm text-gray-500">Debt-to-Income</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(creditDetails.debt_to_income_ratio * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className={`rounded-lg p-4 ${creditDetails.has_defaults ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="flex items-center gap-2">
                {creditDetails.has_defaults ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                <span className={creditDetails.has_defaults ? 'text-red-800' : 'text-green-800'}>
                  {creditDetails.has_defaults ? 'Previous defaults found' : 'No previous defaults'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Credit Check Action */}
        {canRunCreditCheck && (
          <>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CreditCard className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Credit Bureau Check</h3>
                  <p className="text-sm text-blue-700 mt-1">
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
            <div className="animate-spin h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Processing credit check...</p>
          </div>
        )}
      </div>
    </div>
  );
}
