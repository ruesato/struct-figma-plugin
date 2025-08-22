import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: Array<{message: string, level: string, timestamp: string}>;
}

const ActivityLogModal: React.FC<ActivityLogModalProps> = ({ isOpen, onClose, logs }) => {
  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-2xl p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-sm font-normal text-zinc-300 uppercase tracking-wide">
            ACTIVITY HISTORY
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 pb-6">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-400">No activity logged yet.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-xs text-zinc-400">
                    {formatDate(log.timestamp)}
                  </div>
                  <div className="text-sm text-zinc-100 leading-relaxed">
                    {log.message}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-center pt-6 mt-6 border-t border-zinc-800">
            <Button
              onClick={onClose}
              className="bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700 px-8"
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