export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  ...props
}) {
  const baseClass = 'rounded-xl flex items-center justify-center flex-nowrap whitespace-nowrap font-bold transition-all active:scale-95';
  
  const variants = {
    primary: 'text-white bg-green-600 hover:bg-brand-green border-none shadow-sm hover:shadow',
    secondary: 'bg-slate-800 text-white hover:bg-slate-900 border-none shadow-sm',
    outline: 'bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 border-none',
    danger: 'text-white bg-rose-500 hover:bg-rose-600 border-none shadow-sm hover:shadow',
  };
  
  const sizes = {
    xs: 'h-7 px-2.5 text-xs',
    sm: 'h-9 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };
  
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {icon && <span className={`flex items-center justify-center shrink-0 ${children ? 'mr-1' : ''}`}>{icon}</span>}
      {children}
    </button>
  );
}
