import React from 'react';

interface ActionSectionProps {
  handleApplyData: () => void;
  selectionCount: number;
}

const ActionSection: React.FC<ActionSectionProps> = ({ handleApplyData, selectionCount }) => (
  <section className="action-section">
    <button
      onClick={handleApplyData}
      className="btn-primary w-full"
      disabled={selectionCount === 0}
    >
      Apply Data to Selection ({selectionCount} layer{selectionCount !== 1 ? 's' : ''})
    </button>
  </section>
);

export default ActionSection;