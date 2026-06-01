import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo } from 'react-icons/fi';

export default function GlobalAlert({ message, type }) {
  if (!message) return null;
  const styles = {
    success: 'bg-green-50 text-green-900 border-green-300',
    warning: 'bg-amber-50 text-amber-900 border-amber-300',
    error:   'bg-red-50 text-red-900 border-red-300',
    info:    'bg-blue-50 text-blue-900 border-blue-300',
  };
  const icons = {
    success: <FiCheckCircle className="text-2xl text-green-600" />,
    warning: <FiAlertTriangle className="text-2xl text-amber-600" />,
    error:   <FiXCircle className="text-2xl text-red-600" />,
    info:    <FiInfo className="text-2xl text-blue-600" />,
  };
  return (
    <div
      className={`fixed top-4 right-4 z-[999] flex items-start gap-3 p-4 pr-5 rounded-2xl shadow-2xl border-2 max-w-sm w-full animate-fade-in ${
        styles[type] || styles.info
      }`}
    >
      <div className="shrink-0 mt-0.5">{icons[type] || icons.info}</div>
      <p className="text-sm font-black leading-snug">{message}</p>
    </div>
  );
}
