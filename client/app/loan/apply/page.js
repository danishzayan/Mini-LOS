'use client';

import { useState, useEffect } from 'react';
import Stepper from '@/components/Stepper';
import OnboardingForm from '@/components/forms/OnboardingForm';
import KYCStep from '@/components/forms/KYCStep';
import CreditStep from '@/components/forms/CreditStep';
import EligibilityResult from '@/components/forms/EligibilityResult';
import { useLoanApplication } from '@/hooks/useLoanApplication';
import { WORKFLOW_STATES, STATE_TO_STEP } from '@/utils/constants';
import { AlertCircle } from 'lucide-react';

export default function LoanApplyPage() {
  const {
    loan,
    loading,
    error,
    currentStep,
    createLoan,
    submitKYC,
    runCreditCheck,
    isComplete,
    reset,
  } = useLoanApplication();

  const [completedSteps, setCompletedSteps] = useState([]);

  // Update completed steps based on loan state
  useEffect(() => {
    if (loan) {
      const step = STATE_TO_STEP[loan.workflow_state] || 1;
      const completed = [];
      for (let i = 1; i < step; i++) {
        completed.push(i);
      }
      // Mark current step as completed if moving to next
      if ([WORKFLOW_STATES.KYC_COMPLETED, WORKFLOW_STATES.CREDIT_CHECK_COMPLETED, 
           WORKFLOW_STATES.ELIGIBLE, WORKFLOW_STATES.NOT_ELIGIBLE].includes(loan.workflow_state)) {
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
      return <OnboardingForm onSubmit={handleOnboardingSubmit} loading={loading} />;
    }

    const state = loan.workflow_state;

    if (state === WORKFLOW_STATES.KYC_PENDING) {
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

    return <OnboardingForm onSubmit={handleOnboardingSubmit} loading={loading} />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Application</h1>
        <p className="text-gray-600">Complete the following steps to apply for a loan</p>
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
