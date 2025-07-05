import React, { useState, useEffect } from "react";

// Mocked warehouse data (replace with real API calls)
const mockData = {
  stats: [
    { label: "Total Goods", value: 1480 },
    { label: "Pending Orders", value: 67 },
    { label: "Shipped Today", value: 32 },
    { label: "Damaged Reports", value: 3, type: "warn" }
  ],
  recentGoods: [
    { id: 1, name: "Steel Rods", status: "Received", date: "2025-07-05" },
    { id: 2, name: "Copper Wire", status: "Shipped", date: "2025-07-05" },
    { id: 3, name: "Plastic Sheets", status: "In Storage", date: "2025-07-04" },
    { id: 4, name: "Wood Planks", status: "Received", date: "2025-07-04" }
  ],
  alerts: [
    { type: "warn", message: "3 items reported as damaged today" },
    { type: "error", message: "1 shipment delayed due to weather" }
  ],
  footer: "Warehouse system © 2025 | All data are updated in real-time."
};

// Badge generator
const statusBadge = (status) => {
  switch (status) {
    case "Received":
      return <span className="wh-badge wh-badge-delivered">Received</span>;
    case "Shipped":
      return <span className="wh-badge wh-badge-shipped">Shipped</span>;
    case "In Storage":
      return <span className="wh-badge wh-badge-pending">In Storage</span>;
    default:
      return <span className="wh-badge">{status}</span>;
  }
};

export default function GeneralDashboard() {
  const [data, setData] = useState(mockData);
  const [time, setTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="wh-dashboard-bg" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* HEADER with dynamic time and auth links */}
      <header
        className="wh-dashboard-header"
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "#f9fafb",
          padding: "1rem 2rem",
          zIndex: 2,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        {/* Left - Title */}
        <div>
          <h1 style={{ margin: 0, fontSize: "1.75rem" }}>StockHub</h1>
          <div className="wh-date" style={{ fontSize: "0.95rem", color: "#555" }}>
            {time.toLocaleString()}
          </div>
        </div>

        {/* Right - Auth Section */}
        <div className="wh-auth-actions" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <a href="/login" className="auth-link">Sign In</a>
          <a href="/register" className="auth-link">Sign Up</a>
        </div>
      </header>

      {/* BODY */}
      <main className="wh-dashboard-main" style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
        
        {/* Stats Cards */}
        <section className="wh-stats-cards" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          {data.stats.map((stat, i) => (
            <div className="wh-card" key={i} style={{
              flex: "1 1 200px",
              background: "#ffffffaa",
              padding: "1rem",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              textAlign: "center"
            }}>
              <div className={`wh-card-label ${stat.type ? `wh-${stat.type}` : ""}`} style={{ fontWeight: "bold", fontSize: "1rem" }}>
                {stat.label}
              </div>
              <div className={`wh-card-value ${stat.type ? `wh-${stat.type}` : ""}`} style={{ fontSize: "1.5rem", marginTop: "0.5rem" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </section>

        {/* Recent Goods Table */}
        <section className="wh-main-block" style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "0.75rem" }}>Recent Goods Movement</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="wh-table" style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: "8px", overflow: "hidden" }}>
              <thead style={{ background: "#f3f4f6" }}>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Goods Name</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentGoods.map((good) => (
                  <tr key={good.id} style={{ textAlign: "center" }}>
                    <td style={tdStyle}>{good.id}</td>
                    <td style={tdStyle}>{good.name}</td>
                    <td style={tdStyle}>{statusBadge(good.status)}</td>
                    <td style={tdStyle}>{good.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Alerts Section */}
        <aside className="wh-side-block">
          <div className="wh-block" style={{ background: "#fff3cd", padding: "1rem", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.1rem" }}>Alerts & Notices</h3>
            <ul className="wh-alert-list" style={{ paddingLeft: "1.25rem" }}>
              {data.alerts.map((alert, i) => (
                <li key={i} style={{ color: alert.type === "error" ? "#dc2626" : "#b45309", marginBottom: "0.5rem" }}>
                  {alert.message}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </main>

      {/* FOOTER */}
      <footer style={{
        width: "100%",
        textAlign: "center",
        color: "#40638b",
        padding: "1rem",
        fontSize: "0.95rem",
        background: "#f9fafb",
        borderTop: "1px solid #e5e7eb",
        position: "sticky",
        bottom: 0,
        zIndex: 1
      }}>
        {data.footer}
      </footer>
    </div>
  );
}

// Shared table styles
const thStyle = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontWeight: "600",
  borderBottom: "1px solid #e5e7eb"
};

const tdStyle = {
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #f3f4f6"
};
