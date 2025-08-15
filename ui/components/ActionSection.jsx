const ActionSection = ({ handleApplyData, selectionCount }) => (
  <section className="action-section">
    <button
      className="btn-success w-full"
      onClick={handleApplyData}
      disabled={selectionCount === 0}
    >
      Apply Data to Selection
    </button>
  </section>
);