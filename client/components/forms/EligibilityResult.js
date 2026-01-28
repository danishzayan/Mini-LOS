'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/common/Button';
import StatusBadge from '@/components/StatusBadge';
import { WORKFLOW_STATES } from '@/utils/constants';
import { CheckCircle, XCircle, ArrowRight, Home, Trophy, FileText, User, IndianRupee, Award, CreditCard } from 'lucide-react';

export default function EligibilityResult({ loan, onReset }) {
  const router = useRouter();
  // Backend uses 'status', normalize to handle both
  const status = loan?.status || loan?.workflow_state;
  const isEligible = status === WORKFLOW_STATES.ELIGIBLE;

  // Backend returns kyc_result, credit_result, eligibility_result
  const kycResult = loan?.kyc_result || loan?.kyc_details;
  const creditResult = loan?.credit_result || loan?.credit_details;
  const eligibilityResult = loan?.eligibility_result || loan?.eligibility_details;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-6 md:p-8 text-center transition-all duration-300 hover:shadow-card-hover">
        {isEligible ? (
          <>
            <div className="relative inline-block">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full mb-6 shadow-lg">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center shadow-glow animate-bounce">
                <Trophy className="h-5 w-5 text-dark-900" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-emerald-700 mb-3">
              🎉 Congratulations! You're Eligible
            </h2>
            <p className="text-dark-600 mb-8 text-lg">
              Your loan application has been approved based on your KYC and credit assessment.
            </p>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-rose-400 to-rose-600 rounded-full mb-6 shadow-lg">
              <XCircle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-rose-700 mb-3">
              Application Not Approved
            </h2>
            <p className="text-dark-600 mb-8 text-lg">
              Unfortunately, we couldn't approve your loan application at this time.
            </p>
          </>
        )}

        <div className="inline-block mb-8">
          <StatusBadge status={status} size="lg" />
        </div>

        {/* Loan Summary */}
        <div className="bg-gradient-to-br from-dark-50 to-dark-100 rounded-2xl p-6 text-left mb-8 border border-dark-200">
          <h3 className="font-bold text-dark-900 mb-5 flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Application Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl p-4 border border-dark-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-sm">#</span>
                </div>
                <div>
                  <p className="text-xs text-dark-500 uppercase tracking-wide">Application ID</p>
                  <p className="font-semibold text-dark-900">{loan?.id}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-dark-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-dark-500 uppercase tracking-wide">Applicant</p>
                  <p className="font-semibold text-dark-900">{loan?.full_name}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-dark-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-dark-500 uppercase tracking-wide">Requested Amount</p>
                  <p className="font-semibold text-dark-900">₹{(loan?.loan_amount || loan?.requested_amount)?.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-dark-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-dark-500 uppercase tracking-wide">Monthly Income</p>
                  <p className="font-semibold text-dark-900">₹{loan?.monthly_income?.toLocaleString()}</p>
                </div>
              </div>
            </div>
            {kycResult && (
              <div className="bg-white rounded-xl p-4 border border-dark-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500 uppercase tracking-wide">KYC Score</p>
                    <p className="font-semibold text-emerald-600">{kycResult.name_match_score || kycResult.kyc_score || kycResult.score || 0}/100</p>
                  </div>
                </div>
              </div>
            )}
            {creditResult && (
              <div className="bg-white rounded-xl p-4 border border-dark-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-dark-500 uppercase tracking-wide">Credit Score</p>
                    <p className="font-semibold text-emerald-600">{creditResult.credit_score || creditResult.score}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Reasons */}
        {!isEligible && eligibilityResult?.rejection_reasons?.length > 0 && (
          <div className="bg-rose-50 rounded-2xl p-6 text-left mb-8 border border-rose-200">
            <h3 className="font-semibold text-rose-800 mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Reasons for Rejection
            </h3>
            <ul className="space-y-2">
              {eligibilityResult.rejection_reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-3 text-rose-700">
                  <span className="w-6 h-6 bg-rose-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold mt-0.5">
                    {index + 1}
                  </span>
                  {reason}
                </li>
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
