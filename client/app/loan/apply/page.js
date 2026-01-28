'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Stepper from '@/components/Stepper';
import OnboardingForm from '@/components/forms/OnboardingForm';
import KYCStep from '@/components/forms/KYCStep';
import CreditStep from '@/components/forms/CreditStep';
import EligibilityResult from '@/components/forms/EligibilityResult';
import { useLoanApplication } from '@/hooks/useLoanApplication';
import { authService } from '@/services/loan.service';
import { WORKFLOW_STATES, STATE_TO_STEP } from '@/utils/constants';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function LoanApplyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const continueId = searchParams.get('continue');
  
  const [authChecking, setAuthChecking] = useState(true);
  const [user, setUser] = useState(null);
  
  const {
    loan,
    loading,
    error,
    currentStep,
    createLoan,
    fetchLoan,
    submitKYC,
    runCreditCheck,
    isComplete,
    reset,
  } = useLoanApplication();

  const [completedSteps, setCompletedSteps] = useState([]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth?redirect=/loan/apply');
        return;
      }

      try {
        const userData = await authService.getMe();
        setUser(userData);
        setAuthChecking(false);
        
        // If continuing an existing application, fetch it
        if (continueId) {
          await fetchLoan(parseInt(continueId));
        }
      } catch (err) {
        localStorage.removeItem('token');
        router.push('/auth?redirect=/loan/apply');
      }
    };

    checkAuth();
  }, [router, continueId, fetchLoan]);

  // Update completed steps based on loan state
  useEffect(() => {
    if (loan) {
      const step = STATE_TO_STEP[loan.workflow_state] || 1;
      const completed = [];
      for (let i = 1; i < step; i++) {
        completed.push(i);
      }
      // Mark current step as completed if moving to next
      const status = loan.status || loan.workflow_state;
      if ([WORKFLOW_STATES.KYC_COMPLETED, WORKFLOW_STATES.CREDIT_CHECK_COMPLETED, 
           WORKFLOW_STATES.ELIGIBLE, WORKFLOW_STATES.NOT_ELIGIBLE].includes(status)) {
        completed.push(step);
      }
      setCompletedSteps(completed);
    }
  }, [loan]);

  // Handle form submission
  const handleOnboardingSubmit = async (data) => {
    try {
      await createLoan(data);
    } catch (err) {
      console.error('Failed to create loan:', err);
    }
  };

  // Handle KYC submission
  const handleKYCSubmit = async () => {
    try {
      await submitKYC();
    } catch (err) {
      console.error('KYC submission failed:', err);
    }
  };

  // Handle credit check
  const handleCreditCheck = async () => {
    try {
      await runCreditCheck();
    } catch (err) {
      console.error('Credit check failed:', err);
    }
  };

  // Determine which step to show
  const getStepContent = () => {
    if (!loan) {
      return <OnboardingForm onSubmit={handleOnboardingSubmit} loading={loading} user={user} />;
    }

    // Backend uses 'status', normalize to handle both
    const state = loan.status || loan.workflow_state;

    // After DRAFT, move to KYC step
    if (state === WORKFLOW_STATES.DRAFT || state === WORKFLOW_STATES.KYC_PENDING) {
      return <KYCStep loan={loan} onSubmit={handleKYCSubmit} loading={loading} />;
    }

    if (state === WORKFLOW_STATES.KYC_COMPLETED) {
      return <CreditStep loan={loan} onSubmit={handleCreditCheck} loading={loading} />;
    }

    if (state === WORKFLOW_STATES.CREDIT_CHECK_PENDING || 
        state === WORKFLOW_STATES.CREDIT_CHECK_COMPLETED) {
      return <CreditStep loan={loan} onSubmit={handleCreditCheck} loading={loading} />;
    }

    if (state === WORKFLOW_STATES.ELIGIBLE || state === WORKFLOW_STATES.NOT_ELIGIBLE) {
      return <EligibilityResult loan={loan} onReset={reset} />;
    }

    return <OnboardingForm onSubmit={handleOnboardingSubmit} loading={loading} user={user} />;
  };

  // Show loading while checking auth
  if (authChecking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-dark-500">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/my-applications')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Back Dashboard</span>
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Onboarding</h1>
        <p className="text-gray-600">
          Welcome, <span className="font-semibold text-primary-600">{user?.full_name}</span>! Complete the following steps to apply for a loan.
        </p>
      </div>

      {/* Stepper */}
      <Stepper currentStep={currentStep} completedSteps={completedSteps} />

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Step Content */}
      {getStepContent()}

      {/* Loan ID Display */}
      {loan && !isComplete && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Application ID: <span className="font-mono font-medium">#{loan.id}</span>
        </div>
      )}
    </div>
  );
}
