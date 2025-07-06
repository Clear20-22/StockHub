import React from "react";
import { useNavigate } from "react-router-dom";
import "./GeneralDashboard.css";

// assuming the CSS below is in this file

const branches = [
  {
    name: "Dhaka Branch",
    location: "Gulshan",
    employees: 120,
    image: "https://source.unsplash.com/400x300/?office,dhaka",
  },
  {
    name: "Chittagong Branch",
    location: "Agrabad",
    employees: 95,
    image: "https://source.unsplash.com/400x300/?office,chittagong",
  },
];

const goods = [
  {
    name: "Electronics",
    description: "High-end electronic devices and accessories.",
    image: "https://source.unsplash.com/400x300/?electronics,warehouse",
  },
  {
    name: "Furniture",
    description: "Wooden and steel furniture items.",
    image: "https://source.unsplash.com/400x300/?furniture,warehouse",
  },
];

export default function GeneralDashboard() {

  const navigate = useNavigate();
  return (
    <div className="wh-dashboard-bg">
      {/* Sidebar example (optional) */}
      {/* <div className="wh-sidebar">
        <h2>MyCompany</h2>
        <nav>
          <a href="#" className="active">Dashboard</a>
          <a href="#">Branches</a>
          <a href="#">Goods</a>
          <a href="#">Settings</a>
        </nav>
      </div> */}

      <div className="wh-dashboard-main">
      <header className="wh-dashboard-header">
        <div className="wh-logo">📦 MyCompany</div>

        <nav className="wh-nav">
          <a href="#">Dashboard</a>
          <a href="#">Branches</a>
          <a href="#">Goods</a>
          <a href="#">Contact</a>
        </nav>

        <div className="wh-auth">
          <button className="wh-login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="wh-signup-btn" onClick={() => navigate("/register")}>
            Sign Up
          </button>
        </div>
      </header>

        {/* Branch Section */}
        <div className="wh-main-block">
          <h2>Our Branches</h2>
          <div className="wh-stats-cards">
            {branches.map((branch, index) => (
              <div key={index} className="wh-card">
                <img
                  src={branch.image}
                  alt={branch.name}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
                <div className="wh-card-label">{branch.name}</div>
                <div className="wh-card-value">📍 {branch.location}</div>
                <div className="wh-card-value">👥 {branch.employees} Employees</div>
              </div>
            ))}
          </div>
        </div>

        {/* Goods Section */}
        <div className="wh-main-block">
          <h2>Types of Goods Stored</h2>
          <div className="wh-stats-cards">
            {goods.map((item, index) => (
              <div key={index} className="wh-card">
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
                <div className="wh-card-label">{item.name}</div>
                <div className="wh-card-value" style={{ fontSize: "1rem", color: "#40638b" }}>
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="footer" style={{ marginTop: "3rem", textAlign: "center", color: "#999" }}>
          © {new Date().getFullYear()} MyCompany. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
