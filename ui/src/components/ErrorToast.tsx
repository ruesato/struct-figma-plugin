import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastError {
  id: string;
  severity: 'error' | 'warning' | 'validation';
  title: string;
  message: string;
  timestamp: string;
}

interface ErrorToastProps {
  errors: ToastError[];
  onDismiss: (id: string) => void;
  onOpenActivityLog: () => void;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ errors, onDismiss, onOpenActivityLog }) => {
  const getSeverityStyles = (severity: ToastError['severity']) => {
    switch (severity) {
      case 'error':
        return {
          background: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          icon: 'text-red-400',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          background: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-400',
          iconBg: 'bg-yellow-100'
        };
      case 'validation':
        return {
          background: 'bg-orange-50 border-orange-200',
          text: 'text-orange-800',
          icon: 'text-orange-400',
          iconBg: 'bg-orange-100'
        };
    }
  };

  const getSeverityIcon = (severity: ToastError['severity']) => {
    switch (severity) {
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'validation':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getSeverityLabel = (severity: ToastError['severity']) => {
    switch (severity) {
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'validation':
        return 'Validation Issue';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 space-y-2">
      <AnimatePresence>
        {errors.map((error) => {
          const styles = getSeverityStyles(error.severity);
          return (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`rounded-lg border p-4 shadow-lg backdrop-blur-sm ${styles.background}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 rounded-full p-1 ${styles.iconBg}`}>
                  <div className={styles.icon}>
                    {getSeverityIcon(error.severity)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className={`text-sm font-medium ${styles.text}`}>
                        {getSeverityLabel(error.severity)}: {error.title}
                      </h3>
                      <p className={`mt-1 text-sm ${styles.text} opacity-90`}>
                        {error.message}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <button
                          onClick={onOpenActivityLog}
                          className={`text-xs font-medium underline hover:no-underline ${styles.text} opacity-75 hover:opacity-100 transition-opacity`}
                        >
                          View technical details →
                        </button>
                        <span className={`text-xs ${styles.text} opacity-60`}>
                          {error.timestamp}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onDismiss(error.id)}
                      className={`flex-shrink-0 p-1 rounded-md hover:bg-black hover:bg-opacity-10 transition-colors ${styles.text} opacity-60 hover:opacity-100`}
                      title="Dismiss"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ErrorToast;