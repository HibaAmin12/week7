// ==========================================================
// Dashboard
// ==========================================================

function Dashboard({ onNotes, onCreateNote }) {

  return (
    <div className="dashboard-page">

      <div className="dashboard-hero">

        <span className="dashboard-label">
          NOTES WORKSPACE
        </span>

        <h1>
          Welcome to your
          <span> Notes Dashboard.</span>
        </h1>

        <p>
          A simple, calm space to capture your
          ideas, thoughts, reminders, and everything
          worth remembering.
        </p>

        <div className="dashboard-actions">

          <button
            type="button"
            className="dashboard-primary"
            onClick={onNotes}
          >
            View My Notes
            <span>→</span>
          </button>

          <button
            type="button"
            className="dashboard-secondary"
            onClick={onCreateNote}
          >
            + Create Note
          </button>

        </div>

      </div>

      <div className="dashboard-features">

        <div className="dashboard-feature">
          <span>✦</span>
          <div>
            <strong>Simple</strong>
            <p>Keep your workspace clean.</p>
          </div>
        </div>

        <div className="dashboard-feature">
          <span>🔐</span>
          <div>
            <strong>Secure</strong>
            <p>Your notes stay protected.</p>
          </div>
        </div>

        <div className="dashboard-feature">
          <span>⚡</span>
          <div>
            <strong>Organized</strong>
            <p>Find your thoughts easily.</p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;