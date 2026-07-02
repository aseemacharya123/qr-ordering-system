import React from 'react';

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Dashboard render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ paddingTop: '48px' }}>
          <div className="card state-box">
            <p className="state-title">Something went wrong loading this section.</p>
            <p className="state-message" style={{ marginBottom: '14px' }}>
              Your data is safe — this is just a display issue. Try reloading the page.
            </p>
            <button type="button" className="button button-primary" onClick={() => window.location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
