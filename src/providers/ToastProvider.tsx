import React, { createContext, useContext } from 'react';
import { useToast, type Toast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/ui/Toast';

type ToastContextType = {
  show: (message: string, options?: { type?: Toast['type']; duration?: number }) => string;
  success: (message: string) => string;
  error: (message: string) => string;
  info: (message: string) => string;
  warning: (message: string) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, show, success, error, info, warning, dismiss } = useToast();

  return (
    <ToastContext.Provider value={{ show, success, error, info, warning, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
