'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/StatusBadge';
import { WORKFLOW_STATES } from '@/utils/constants';
import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

export default function KYCStep({ loan, onSubmit, loading }) {
  const [agreed, setAgreed] = useState(false);

  // Backend uses 'status', normalize to handle both
  const status = loan?.status || loan?.workflow_state;
  
  const isKYCPending = status === WORKFLOW_STATES.DRAFT || status === WORKFLOW_STATES.KYC_PENDING;
  const isKYCCompleted = status === WORKFLOW_STATES.KYC_COMPLETED ||
    [WORKFLOW_STATES.CREDIT_CHECK_PENDING, WORKFLOW_STATES.CREDIT_CHECK_COMPLETED, 
     WORKFLOW_STATES.ELIGIBLE, WORKFLOW_STATES.NOT_ELIGIBLE].includes(status);

  // Backend returns kyc_result, not kyc_details
  const kycDetails = loan?.kyc_result || loan?.kyc_details;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-6 md:p-8 transition-all duration-300 hover:shadow-card-hover">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
              <ShieldCheck className="h-5 w-5 text-dark-900" />
            </div>
            <h2 className="text-xl font-bold text-dark-900">KYC Verification</h2>
          </div>
          <StatusBadge status={status} />
        </div>

        {/* Application Summary */}
        <div className="bg-gradient-to-r from-dark-50 to-dark-100 rounded-xl p-5 mb-6 border border-dark-200">
          <h3 className="font-semibold text-dark-900 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Application Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-dark-500 uppercase tracking-wide">Applicant</p>
              <p className="font-semibold text-dark-900 mt-1">{loan?.full_name}</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-dark-500 uppercase tracking-wide">PAN</p>
              <p className="font-semibold text-dark-900 mt-1">{loan?.pan}</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-dark-500 uppercase tracking-wide">Monthly Income</p>
              <p className="font-semibold text-dark-900 mt-1">₹{loan?.monthly_income?.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-dark-500 uppercase tracking-wide">Loan Amount</p>
              <p className="font-semibold text-primary-700 mt-1">₹{loan?.loan_amount?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* KYC Status */}
        {isKYCCompleted && kycDetails && (
          <div className={`rounded-xl p-5 mb-6 border ${kycDetails.status === 'PASSED' || kycDetails.is_verified || kycDetails.kyc_verified ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kycDetails.status === 'PASSED' || kycDetails.is_verified || kycDetails.kyc_verified ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {kycDetails.status === 'PASSED' || kycDetails.is_verified || kycDetails.kyc_verified ? (
                  <CheckCircle className="h-6 w-6 text-white" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-white" />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg ${kycDetails.status === 'PASSED' || kycDetails.is_verified || kycDetails.kyc_verified ? 'text-emerald-800' : 'text-rose-800'}`}>
                  KYC {kycDetails.status === 'PASSED' || kycDetails.is_verified || kycDetails.kyc_verified ? 'Verified Successfully' : 'Verification Failed'}
                </h3>
                <div className="mt-3 grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className="text-2xl font-bold text-dark-900">{kycDetails.name_match_score || kycDetails.kyc_score || kycDetails.score || 0}</p>
                    <p className="text-xs text-dark-500">KYC Score</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className={`text-2xl font-bold ${kycDetails.address_verified === 'YES' || kycDetails.address_verified === true ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {kycDetails.address_verified === 'YES' || kycDetails.address_verified === true ? '✓' : '✗'}
                    </p>
                    <p className="text-xs text-dark-500">Address</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <p className={`text-2xl font-bold ${kycDetails.pan_verified === 'YES' || kycDetails.pan_verified === true || kycDetails.identity_verified ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {kycDetails.pan_verified === 'YES' || kycDetails.pan_verified === true || kycDetails.identity_verified ? '✓' : '✗'}
                    </p>
                    <p className="text-xs text-dark-500">PAN</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KYC Pending - Submit Form */}
        {isKYCPending && (
          <>
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-5 mb-6 border border-primary-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
                  <ShieldCheck className="h-6 w-6 text-dark-900" />
                </div>
                <div>
                  <h3 className="font-bold text-dark-800 text-lg">Identity Verification Required</h3>
                  <p className="text-sm text-dark-600 mt-2 leading-relaxed">
                    We will verify your identity using your PAN and personal details. 
                    This is a simulated verification process for demonstration purposes.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-dark-200 rounded-xl p-5 mb-6 bg-dark-50 hover:border-primary-300 transition-colors duration-300">
              <label className="flex items-start gap-4 cursor-pointer">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-6 h-6 border-2 border-dark-300 rounded-lg bg-white peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all duration-200 flex items-center justify-center">
                    {agreed && (
                      <svg className="w-4 h-4 text-dark-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-dark-700 leading-relaxed">
                  I authorize Mini-LOS to verify my identity and access my KYC details from 
                  government databases. I confirm that all information provided is accurate and true to the best of my knowledge.
                </span>
              </label>
            </div>

            <Button
              onClick={onSubmit}
              loading={loading}
              disabled={!agreed}
              className="w-full"
              size="lg"
            >
              <ShieldCheck className="h-5 w-5 mr-2" />
              Submit for KYC Verification
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
