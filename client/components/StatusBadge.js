import { STATUS_CONFIG, WORKFLOW_STATES } from '@/utils/constants';

export default function StatusBadge({ status, size = 'md' }) {
  // Enhanced status config with modern styling
  const modernConfig = {
    [WORKFLOW_STATES.DRAFT]: {
      label: 'Draft',
      bgColor: 'bg-dark-100',
      textColor: 'text-dark-600',
      borderColor: 'border-dark-200',
    },
    [WORKFLOW_STATES.KYC_PENDING]: {
      label: 'KYC Pending',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
    },
    [WORKFLOW_STATES.KYC_COMPLETED]: {
      label: 'KYC Completed',
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-700',
      borderColor: 'border-sky-200',
    },
    [WORKFLOW_STATES.CREDIT_CHECK_PENDING]: {
      label: 'Credit Check Pending',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
    },
    [WORKFLOW_STATES.CREDIT_CHECK_COMPLETED]: {
      label: 'Credit Check Done',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-700',
      borderColor: 'border-violet-200',
    },
    [WORKFLOW_STATES.ELIGIBLE]: {
      label: 'Eligible ✓',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
    },
    [WORKFLOW_STATES.NOT_ELIGIBLE]: {
      label: 'Not Eligible',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
    },
  };

  const config = modernConfig[status] || STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bgColor: 'bg-dark-100',
    textColor: 'text-dark-600',
    borderColor: 'border-dark-200',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-full border
        ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizes[size]}
        transition-all duration-200 shadow-sm
      `}
    >
      {config.label}
    </span>
  );
}
