import React from 'react';
import './dashboard.css';

const mockData = {
  user: { name: "Sojib" },
  stats: {
    totalItems: 3240,
    lowStock: 12,
    outOfStock: 3,
    warehouses: 4,
    categories: 21,
  },
  recentOrders: [
    { id: "#OR-1001", customer: "Acme Corp", date: "2025-07-05", status: "Shipped", total: 3400 },
    { id: "#OR-1000", customer: "Beta LLC", date: "2025-07-04", status: "Pending", total: 2170 },
    { id: "#OR-0999", customer: "Gamma Inc", date: "2025-07-04", status: "Delivered", total: 1290 },
  ],
  stockAlerts: [
    { item: "USB Cable", sku: "IT-0021", stock: 2 },
    { item: "Laptop Stand", sku: "IT-0078", stock: 0 },
    { item: "Wireless Mouse", sku: "IT-0096", stock: 1 },
  ],
};

export default function WarehouseDashboard() {
  return (
    <div className="wh-dashboard-bg">
      <aside className="wh-sidebar">
        <h2>Warehouse<br />Manager</h2>
        <nav>
          <a href="/dashboard" className="active">Dashboard</a>
          <a href="/inventory">Inventory</a>
          <a href="/orders">Orders</a>
          <a href="/suppliers">Suppliers</a>
          <a href="/reports">Reports</a>
        </nav>
      </aside>
      <main className="wh-dashboard-main">
        <header className="wh-dashboard-header">
          <h1>Hello, {mockData.user.name}</h1>
          <span className="wh-date">{new Date().toLocaleDateString()}</span>
        </header>

        <section className="wh-stats-cards">
          <div className="wh-card">
            <span className="wh-card-label">Total Items</span>
            <span className="wh-card-value">{mockData.stats.totalItems}</span>
          </div>
          <div className="wh-card">
            <span className="wh-card-label">Low Stock</span>
            <span className="wh-card-value wh-warn">{mockData.stats.lowStock}</span>
          </div>
          <div className="wh-card">
            <span className="wh-card-label">Out of Stock</span>
            <span className="wh-card-value wh-error">{mockData.stats.outOfStock}</span>
          </div>
          <div className="wh-card">
            <span className="wh-card-label">Warehouses</span>
            <span className="wh-card-value">{mockData.stats.warehouses}</span>
          </div>
          <div className="wh-card">
            <span className="wh-card-label">Categories</span>
            <span className="wh-card-value">{mockData.stats.categories}</span>
          </div>
        </section>

        <section className="wh-dashboard-grid">
          <div className="wh-main-block">
            <h2>Recent Orders</h2>
            <table className="wh-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total ($)</th>
                </tr>
              </thead>
              <tbody>
                {mockData.recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td>
                      <span className={`wh-badge wh-badge-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="wh-side-block">
            <div className="wh-block">
              <h3>Stock Alerts</h3>
              <ul className="wh-alert-list">
                {mockData.stockAlerts.map(alert => (
                  <li key={alert.sku} className={alert.stock === 0 ? "wh-error" : "wh-warn"}>
                    <strong>{alert.item}</strong> (SKU: {alert.sku}) — 
                    <span>{alert.stock === 0 ? "OUT OF STOCK" : `Low: ${alert.stock}`}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="wh-block">
              <h3>Quick Actions</h3>
              <div className="wh-actions">
                <button onClick={() => alert("Add New Item")}>+ Add Item</button>
                <button onClick={() => alert("Add New Order")}>+ Add Order</button>
                <button onClick={() => alert("View Reports")}>📊 View Reports</button>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}