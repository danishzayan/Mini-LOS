'use client';

import { useState, useCallback } from 'react';
import { loanService } from '@/services/loan.service';
import { WORKFLOW_STATES, STATE_TO_STEP } from '@/utils/constants';

export function useLoanApplication() {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Helper to get status from loan (backend uses 'status' field)
  const getStatus = (loanData) => loanData?.status || loanData?.workflow_state;

  // Create loan application
  const createLoan = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newLoan = await loanService.createLoan(data);
      setLoan(newLoan);
      setCurrentStep(STATE_TO_STEP[getStatus(newLoan)] || 1);
      return newLoan;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to create loan application';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch loan by ID
  const fetchLoan = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const fetchedLoan = await loanService.getLoan(id);
      setLoan(fetchedLoan);
      setCurrentStep(STATE_TO_STEP[getStatus(fetchedLoan)] || 1);
      return fetchedLoan;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch loan';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Submit KYC
  const submitKYC = useCallback(async () => {
    if (!loan) return;
    setLoading(true);
    setError(null);
    try {
      // KYC endpoint returns KYCPerformResponse, not the full loan
      const kycResult = await loanService.submitKYC(loan.id);
      // Refetch the loan to get updated data
      const updatedLoan = await loanService.getLoan(loan.id);
      setLoan(updatedLoan);
      setCurrentStep(STATE_TO_STEP[getStatus(updatedLoan)] || 2);
      return { ...updatedLoan, kycResult };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'KYC submission failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loan]);

  // Run credit check
  const runCreditCheck = useCallback(async () => {
    if (!loan) return;
    setLoading(true);
    setError(null);
    try {
      // Credit check endpoint returns CreditCheckResponse, not the full loan
      const creditResult = await loanService.runCreditCheck(loan.id);
      // Refetch the loan to get updated data
      const updatedLoan = await loanService.getLoan(loan.id);
      setLoan(updatedLoan);
      setCurrentStep(STATE_TO_STEP[getStatus(updatedLoan)] || 3);
      return { ...updatedLoan, creditResult };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Credit check failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loan]);

  // Check if loan is complete
  const isComplete = loan && (
    getStatus(loan) === WORKFLOW_STATES.ELIGIBLE ||
    getStatus(loan) === WORKFLOW_STATES.NOT_ELIGIBLE
  );

  // Check if eligible
  const isEligible = getStatus(loan) === WORKFLOW_STATES.ELIGIBLE;

  // Reset
  const reset = useCallback(() => {
    setLoan(null);
    setError(null);
    setCurrentStep(1);
  }, []);

  return {
    loan,
    loading,
    error,
    currentStep,
    setCurrentStep,
    createLoan,
    fetchLoan,
    submitKYC,
    runCreditCheck,
    isComplete,
    isEligible,
    reset,
  };
}
