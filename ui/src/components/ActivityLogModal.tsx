import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: Array<{message: string, level: string, timestamp: string}>;
}

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose, logs }) => {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        // If it's not a valid date, it might be just a time string
        return timestamp;
      }
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const logDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      
      if (logDate.getTime() === today.getTime()) {
        return `Today ${timeStr}`;
      } else if (logDate.getTime() === today.getTime() - 86400000) {
        return `Yesterday ${timeStr}`;
      } else {
        return `${date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })} ${timeStr}`;
      }
    } catch {
      return timestamp;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--figma-color-bg)] border-[var(--figma-color-border)] text-[var(--figma-color-text)] max-w-2xl p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-sm font-normal text-[var(--figma-color-text-secondary)] uppercase tracking-wide">
            ACTIVITY HISTORY
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--figma-color-text-secondary)]">No activity logged yet.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-xs text-[var(--figma-color-text-secondary)]">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  <div className={`text-sm leading-relaxed ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warn' ? 'text-yellow-400' :
                    log.level === 'success' ? 'text-green-400' :
                    'text-[var(--figma-color-text)]'
                  }`}>
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-6 mt-6 border-t border-[var(--figma-color-border)]">
            <Button
              onClick={onClose}
              className="bg-[var(--figma-color-bg-secondary)] hover:bg-[var(--figma-color-bg-brand)] text-[var(--figma-color-text)] border-[var(--figma-color-border)] px-8"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityLogModal;