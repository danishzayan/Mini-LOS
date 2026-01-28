'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/StatusBadge';
import { WORKFLOW_STATES } from '@/utils/constants';
import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';

export default function KYCStep({ loan, onSubmit, loading }) {
  const [agreed, setAgreed] = useState(false);

  const isKYCPending = loan?.workflow_state === WORKFLOW_STATES.KYC_PENDING;
  const isKYCCompleted = loan?.workflow_state === WORKFLOW_STATES.KYC_COMPLETED ||
    [WORKFLOW_STATES.CREDIT_CHECK_PENDING, WORKFLOW_STATES.CREDIT_CHECK_COMPLETED, 
     WORKFLOW_STATES.ELIGIBLE, WORKFLOW_STATES.NOT_ELIGIBLE].includes(loan?.workflow_state);

  const kycDetails = loan?.kyc_details;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">KYC Verification</h2>
          <StatusBadge status={loan?.workflow_state} />
        </div>

        {/* Application Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Application Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Applicant</p>
              <p className="font-medium">{loan?.full_name}</p>
            </div>
            <div>
              <p className="text-gray-500">PAN</p>
              <p className="font-medium">{loan?.pan_number}</p>
            </div>
            <div>
              <p className="text-gray-500">Monthly Income</p>
              <p className="font-medium">₹{loan?.monthly_income?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Requested Amount</p>
              <p className="font-medium">₹{loan?.requested_amount?.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* KYC Status */}
        {isKYCCompleted && kycDetails && (
          <div className={`rounded-lg p-4 mb-6 ${kycDetails.kyc_verified ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-start gap-3">
              {kycDetails.kyc_verified ? (
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600 mt-0.5" />
              )}
              <div>
                <h3 className={`font-medium ${kycDetails.kyc_verified ? 'text-green-800' : 'text-red-800'}`}>
                  KYC {kycDetails.kyc_verified ? 'Verified' : 'Failed'}
                </h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-gray-600">KYC Score:</span> <span className="font-medium">{kycDetails.kyc_score}/100</span></p>
                  <p><span className="text-gray-600">Address Verified:</span> <span className="font-medium">{kycDetails.address_verified ? 'Yes' : 'No'}</span></p>
                  <p><span className="text-gray-600">Identity Verified:</span> <span className="font-medium">{kycDetails.identity_verified ? 'Yes' : 'No'}</span></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KYC Pending - Submit Form */}
        {isKYCPending && (
          <>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Identity Verification Required</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    We will verify your identity using your PAN and personal details. 
                    This is a simulated verification process.
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">
                  I authorize Mini-LOS to verify my identity and access my KYC details from 
                  government databases. I confirm that all information provided is accurate.
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
              Submit for KYC Verification
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
