import React from 'react';
import { Button } from './ui/button';

interface ActionSectionProps {
  handleApplyData: () => void;
  selectionCount: number;
  onOpenSaveModal: () => void;
}

const ActionSection: React.FC<ActionSectionProps> = ({ handleApplyData, selectionCount, onOpenSaveModal }) => (
  <div className="grid grid-cols-[auto_1fr] gap-3 mt-6">
    <Button 
      variant="outline" 
      className="h-11 px-8"
      onClick={onOpenSaveModal}
    >
      Save configuration
    </Button>
    <Button 
      onClick={handleApplyData}
      disabled={selectionCount === 0}
      className="h-11 flex-1"
    >
      Apply data to selection
    </Button>
  </div>
);

export default ActionSection;