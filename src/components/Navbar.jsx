import React from "react";
import { NavLink } from "react-router-dom";

function Navbar({ dark, setDark }) {
  return (
    <nav style={{
      background: dark ? "#0d0f14" : "#ffffff",
      borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "#eee"}`,
      padding: "0 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 52,
      position: "sticky",
      top: 0,
      zIndex: 10,
      transition: "all 0.2s"
    }}>

      {/* Brand */}
      <div style={{ fontSize: 15, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, color: dark ? "#fff" : "#111" }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#1D9E75",
          boxShadow: "0 0 6px #1D9E75"
        }} />
        PlagioCheck
      </div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: 4 }}>
        {[
          { to: "/", label: "Dashboard" },
          { to: "/upload", label: "Upload" },
          { to: "/results", label: "Results" },
          { to: "/history", label: "History" },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            style={({ isActive }) => ({
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? (dark ? "#fff" : "#111") : (dark ? "#888" : "#666"),
              background: isActive ? (dark ? "rgba(255,255,255,0.08)" : "#f2f2f2") : "transparent",
              border: isActive
                ? `1px solid ${dark ? "rgba(255,255,255,0.12)" : "#ddd"}`
                : "1px solid transparent",
              textDecoration: "none",
              transition: "all 0.15s",
              letterSpacing: "-0.1px",
            })}
          >
            {label}
          </NavLink>
        ))}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={() => setDark(!dark)}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#ddd"}`,
          background: dark ? "#1a1d24" : "#f5f5f5",
          color: dark ? "#aaa" : "#555",
          cursor: "pointer",
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s"
        }}
      >
        {dark ? "☀️" : "🌙"}
      </button>
    </nav>
  );
}

export default Navbar;