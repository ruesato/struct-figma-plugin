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
    // Check if it's already a time string (from toLocaleTimeString())
    if (timestamp.includes(':') && (timestamp.includes('AM') || timestamp.includes('PM') || timestamp.match(/^\d{1,2}:\d{2}(:\d{2})?$/))) {
      return timestamp;
    }
    // Try to parse as full date
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return timestamp;
      }
      return date.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
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
              {[...logs].reverse().map((log, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-xs text-[var(--figma-color-text-secondary)]">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  <div className="text-sm text-[var(--figma-color-text)] leading-relaxed">
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