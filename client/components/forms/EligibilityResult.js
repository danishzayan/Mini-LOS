'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/StatusBadge';
import { WORKFLOW_STATES } from '@/utils/constants';
import { CheckCircle, XCircle, ArrowRight, Home } from 'lucide-react';

export default function EligibilityResult({ loan, onReset }) {
  const router = useRouter();
  const isEligible = loan?.workflow_state === WORKFLOW_STATES.ELIGIBLE;

  return (
    <div className="space-y-6">
      <div className="card text-center">
        {isEligible ? (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Congratulations! You're Eligible
            </h2>
            <p className="text-gray-600 mb-6">
              Your loan application has been approved based on your KYC and credit assessment.
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              Application Not Approved
            </h2>
            <p className="text-gray-600 mb-6">
              Unfortunately, we couldn't approve your loan application at this time.
            </p>
          </>
        )}

        <div className="inline-block mb-6">
          <StatusBadge status={loan?.workflow_state} size="lg" />
        </div>

        {/* Loan Summary */}
        <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Application Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Application ID</p>
              <p className="font-medium">#{loan?.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Applicant</p>
              <p className="font-medium">{loan?.full_name}</p>
            </div>
            <div>
              <p className="text-gray-500">Requested Amount</p>
              <p className="font-medium">₹{loan?.requested_amount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500">Monthly Income</p>
              <p className="font-medium">₹{loan?.monthly_income?.toLocaleString()}</p>
            </div>
            {loan?.kyc_details && (
              <div>
                <p className="text-gray-500">KYC Score</p>
                <p className="font-medium">{loan.kyc_details.kyc_score}/100</p>
              </div>
            )}
            {loan?.credit_details && (
              <div>
                <p className="text-gray-500">Credit Score</p>
                <p className="font-medium">{loan.credit_details.credit_score}</p>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Reasons */}
        {!isEligible && loan?.eligibility_details?.rejection_reasons?.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4 text-left mb-6">
            <h3 className="font-medium text-red-800 mb-2">Reasons for Rejection</h3>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {loan.eligibility_details.rejection_reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Button>
          
          {isEligible ? (
            <Button className="gap-2">
              Proceed to Disbursement
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onReset} className="gap-2">
              Apply Again
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
