import React, { createContext, useContext } from 'react';
import { useToast as useChakraToast, UseToastOptions } from '@chakra-ui/react';

type ToastContextType = (options: UseToastOptions) => void;

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const chakraToast = useChakraToast();

  return (
    <ToastContext.Provider value={chakraToast}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 