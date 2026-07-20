export default function Card({ children, className = '', bodyClassName = 'p-5', title, actions, ...props }) {
  return (
    <div className={`card bg-white shadow-sm border border-slate-100 ${className}`} {...props}>
      <div className={`card-body ${bodyClassName}`}>
        {(title || actions) && (
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            {title && <h2 className="card-title text-lg font-bold text-slate-800">{title}</h2>}
            {actions && <div>{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
