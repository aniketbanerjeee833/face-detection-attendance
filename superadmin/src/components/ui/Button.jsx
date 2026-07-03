import { motion } from 'framer-motion';

const variants = {
  primary:
    'bg-indigo-600 text-white shadow-soft hover:bg-indigo-700 focus-visible:ring-indigo-300 cursor-pointer',
  outline:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:ring-slate-200 cursor-pointer',
  danger:
    'bg-red-500 text-white shadow-soft hover:bg-red-600 focus-visible:ring-red-50 cursor-pointer',
  ghost:
    'bg-transparent text-slate-500 hover:bg-slate-100 focus-visible:ring-slate-200 cursor-pointer',

  checkOut:
    'bg-green-500 text-white shadow-soft hover:bg-green-600 focus-visible:ring-green-50 cursor-pointer',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: 'text-sm px-4 py-2.5 rounded-xl',
  lg: 'text-base px-5 py-3 rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
}