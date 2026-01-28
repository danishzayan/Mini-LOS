// Workflow States
export const WORKFLOW_STATES = {
  DRAFT: 'DRAFT',
  KYC_PENDING: 'KYC_PENDING',
  KYC_COMPLETED: 'KYC_COMPLETED',
  CREDIT_CHECK_PENDING: 'CREDIT_CHECK_PENDING',
  CREDIT_CHECK_COMPLETED: 'CREDIT_CHECK_COMPLETED',
  ELIGIBLE: 'ELIGIBLE',
  NOT_ELIGIBLE: 'NOT_ELIGIBLE',
};

// Status configurations for badges
export const STATUS_CONFIG = {
  [WORKFLOW_STATES.DRAFT]: {
    label: 'Draft',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  },
  [WORKFLOW_STATES.KYC_PENDING]: {
    label: 'KYC Pending',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  [WORKFLOW_STATES.KYC_COMPLETED]: {
    label: 'KYC Completed',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
  },
  [WORKFLOW_STATES.CREDIT_CHECK_PENDING]: {
    label: 'Credit Check Pending',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
  [WORKFLOW_STATES.CREDIT_CHECK_COMPLETED]: {
    label: 'Credit Check Completed',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
  },
  [WORKFLOW_STATES.ELIGIBLE]: {
    label: 'Eligible',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  [WORKFLOW_STATES.NOT_ELIGIBLE]: {
    label: 'Not Eligible',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
};

// Stepper steps configuration
export const STEPS = [
  { id: 1, name: 'Personal Info', description: 'Basic details' },
  { id: 2, name: 'KYC Verification', description: 'Identity check' },
  { id: 3, name: 'Credit Check', description: 'Credit assessment' },
  { id: 4, name: 'Result', description: 'Eligibility status' },
];

// Map workflow state to step number
export const STATE_TO_STEP = {
  [WORKFLOW_STATES.DRAFT]: 1,
  [WORKFLOW_STATES.KYC_PENDING]: 2,
  [WORKFLOW_STATES.KYC_COMPLETED]: 2,
  [WORKFLOW_STATES.CREDIT_CHECK_PENDING]: 3,
  [WORKFLOW_STATES.CREDIT_CHECK_COMPLETED]: 3,
  [WORKFLOW_STATES.ELIGIBLE]: 4,
  [WORKFLOW_STATES.NOT_ELIGIBLE]: 4,
};

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  ME: '/api/v1/auth/me',
  
  // Loan
  CREATE_LOAN: '/api/v1/loan/create',
  GET_LOAN: (id) => `/api/v1/loan/${id}`,
  UPDATE_LOAN: (id) => `/api/v1/loan/${id}`,
  MY_LOANS: '/api/v1/loan/my-loans',
  
  // KYC - endpoint is under /loan for submit, /kyc for get/retry
  SUBMIT_KYC: (id) => `/api/v1/loan/${id}/kyc`,
  GET_KYC: (id) => `/api/v1/kyc/${id}`,
  RETRY_KYC: (id) => `/api/v1/kyc/${id}/retry`,
  
  // Credit - endpoint is under /loan for submit, /credit for get
  RUN_CREDIT_CHECK: (id) => `/api/v1/loan/${id}/credit-check`,
  GET_CREDIT: (id) => `/api/v1/credit/${id}`,
  GET_ELIGIBILITY: (id) => `/api/v1/credit/${id}/eligibility`,
  
  // Admin
  ALL_LOANS: '/api/v1/admin/loans',
  LOAN_STATS: '/api/v1/admin/loans/stats',
  LOAN_HISTORY: (id) => `/api/v1/admin/loans/${id}/history`,
};
