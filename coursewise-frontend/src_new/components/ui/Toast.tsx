import React from 'react';
import { useToast } from '../../lib/hooks/useToast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, closeToast } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center justify-between rounded-lg shadow-lg px-4 py-3 min-w-[300px] max-w-md transform transition-all duration-300 ease-in-out animate-slide-up ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border-l-4 border-green-500'
              : toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-l-4 border-red-500'
              : toast.type === 'warning'
              ? 'bg-yellow-50 text-yellow-800 border-l-4 border-yellow-500'
              : 'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button 
            onClick={() => closeToast(toast.id)} 
            className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
}; 