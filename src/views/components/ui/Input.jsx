export default function Input({
  label,
  error,
  icon,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`form-control w-full ${containerClassName}`}>
      {label && (
        <label className="label">
          <span className="label-text font-semibold text-slate-700">{label}</span>
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            {icon}
          </span>
        )}
        <input 
          className={`input input-bordered w-full bg-slate-50 focus:input-success ${icon ? 'pl-10' : ''} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
