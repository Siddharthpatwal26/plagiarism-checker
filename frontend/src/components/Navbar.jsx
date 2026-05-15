import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { FiSun, FiMoon, FiActivity, FiUploadCloud, FiBarChart2, FiClock } from "react-icons/fi";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const navLinks = [
    { to: "/", label: "Dashboard", icon: <FiActivity /> },
    { to: "/upload", label: "Upload", icon: <FiUploadCloud /> },
    { to: "/results", label: "Results", icon: <FiBarChart2 /> },
    { to: "/history", label: "History", icon: <FiClock /> },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="glass-panel"
      style={{
        margin: "1rem 2rem",
        padding: "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: "1rem",
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="icon-glow"
        style={{ fontSize: 20, fontWeight: 800, display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <div style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "var(--accent-primary)",
          boxShadow: "0 0 15px var(--glow-color)"
        }} />
        <span style={{ background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          PlagioCheck
        </span>
      </motion.div>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: 8 }}>
        {navLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `btn-glow ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "#fff" : "var(--text-secondary)",
              background: isActive ? "var(--accent-primary)" : "transparent",
              transition: "all 0.3s ease",
            })}
          >
            {React.cloneElement(icon, { className: "icon-glow" })}
            {label}
          </NavLink>
        ))}
      </div>

      {/* Theme Toggle */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        className="btn-glow"
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "1px solid var(--border-color)",
          background: "var(--bg-glass)",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
        }}
      >
        {isDark ? <FiSun className="icon-glow" /> : <FiMoon className="icon-glow" />}
      </motion.button>
    </motion.nav>
  );
}

export default Navbar;