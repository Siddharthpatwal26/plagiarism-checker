import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { FiSun, FiMoon, FiActivity, FiUploadCloud, FiBarChart2, FiClock, FiUser, FiLogOut, FiChevronDown } from "react-icons/fi";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
      <Link to="/" style={{ textDecoration: 'none' }}>
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
      </Link>

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

      {/* Right Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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

        {/* User Profile / Login */}
        {isAuthenticated ? (
          <div style={{ position: 'relative' }}>
            <motion.div 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              whileHover={{ scale: 1.02 }}
              className="glass-panel-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 12px',
                borderRadius: 12,
                cursor: 'pointer',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 14
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{user.name}</span>
              <FiChevronDown style={{ fontSize: 12, color: 'var(--text-secondary)' }} />
            </motion.div>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    minWidth: 180,
                    padding: 8,
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 4 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Signed in as</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: '#ff4444',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'background 0.2s'
                    }}
                    className="hover-bg-error"
                  >
                    <FiLogOut /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <FiUser /> Sign In
            </motion.button>
          </Link>
        )}
      </div>
    </motion.nav>
  );
}

export default Navbar;