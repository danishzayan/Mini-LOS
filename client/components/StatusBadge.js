import { STATUS_CONFIG } from '@/utils/constants';

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${config.bgColor} ${config.textColor} ${sizes[size]}
      `}
    >
      {config.label}
    </span>
  );
}
