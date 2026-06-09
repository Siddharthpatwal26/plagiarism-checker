import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { FiSun, FiMoon, FiActivity, FiUploadCloud, FiBarChart2, FiClock, FiUser, FiLogOut, FiChevronDown, FiMenu, FiX } from "react-icons/fi";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false); // ✅ Mobile menu
  const isDark = theme === 'dark';

  const navLinks = [
    { to: "/", label: "Dashboard", icon: <FiActivity /> },
    { to: "/upload", label: "Upload", icon: <FiUploadCloud /> },
    { to: "/results", label: "Results", icon: <FiBarChart2 /> },
    { to: "/history", label: "History", icon: <FiClock /> },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="glass-panel"
        style={{
          margin: "1rem",
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
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--accent-primary)", boxShadow: "0 0 15px var(--glow-color)" }} />
            <span style={{ background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              PlagioCheck
            </span>
          </motion.div>
        </Link>

        {/* ✅ Desktop Nav Links — hidden on mobile */}
        <div style={{ display: "flex", gap: 8 }} className="desktop-nav">
          {navLinks.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `btn-glow ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 8,
                padding: "8px 16px", borderRadius: 12, fontSize: 14,
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
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="btn-glow"
            style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid var(--border-color)", background: "var(--bg-glass)", color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}
          >
            {isDark ? <FiSun className="icon-glow" /> : <FiMoon className="icon-glow" />}
          </motion.button>

          {/* User Profile / Login — Desktop */}
          <div className="desktop-nav">
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <motion.div
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  whileHover={{ scale: 1.02 }}
                  className="glass-panel-hover"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 12px', borderRadius: 12, cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
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
                      style={{ position: 'absolute', top: '120%', right: 0, minWidth: 180, padding: 8, borderRadius: 12, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', zIndex: 100 }}
                    >
                      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: 4 }}>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Signed in as</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                      </div>
                      <button
                        onClick={() => { logout(); setShowProfileMenu(false); }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: 'transparent', color: '#ff4444', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
                      >
                        <FiLogOut /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="glass-button" style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600 }}>
                  <FiUser /> Sign In
                </motion.button>
              </Link>
            )}
          </div>

          {/* ✅ Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="mobile-menu-btn btn-glow"
            style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid var(--border-color)", background: "var(--bg-glass)", color: "var(--text-primary)", display: "none", alignItems: "center", justifyContent: "center", fontSize: 20 }}
          >
            {showMobileMenu ? <FiX /> : <FiMenu />}
          </motion.button>
        </div>
      </motion.nav>

      {/* ✅ Mobile Dropdown Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-panel mobile-menu"
            style={{ margin: '0 1rem 1rem', padding: '1rem', borderRadius: 16, overflow: 'hidden', zIndex: 40 }}
          >
            {/* Mobile Nav Links */}
            {navLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                onClick={() => setShowMobileMenu(false)}
                style={({ isActive }) => ({
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 12, fontSize: 15,
                  fontWeight: isActive ? 600 : 500, marginBottom: 4,
                  color: isActive ? "#fff" : "var(--text-primary)",
                  background: isActive ? "var(--accent-primary)" : "transparent",
                  textDecoration: 'none',
                })}
              >
                {React.cloneElement(icon, {})}
                {label}
              </NavLink>
            ))}

            {/* Mobile User Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: 8, paddingTop: 8 }}>
              {isAuthenticated ? (
                <>
                  <div style={{ padding: '8px 16px', marginBottom: 4 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Signed in as</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{user.email}</p>
                  </div>
                  <button
                    onClick={() => { logout(); setShowMobileMenu(false); }}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, border: 'none', background: 'transparent', color: '#ff4444', cursor: 'pointer', fontSize: 15, fontWeight: 500 }}
                  >
                    <FiLogOut /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" style={{ textDecoration: 'none' }} onClick={() => setShowMobileMenu(false)}>
                  <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 12, border: 'none', background: 'var(--accent-primary)', color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>
                    <FiUser /> Sign In
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Responsive CSS — all screen sizes */}
      <style>{`
        /* Large desktop (1200px+) */
        @media (min-width: 1200px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
          nav { margin: 1rem 2rem !important; }
        }

        /* Tablet landscape (900px - 1199px) */
        @media (max-width: 1199px) and (min-width: 901px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-menu { display: none !important; }
          nav { margin: 0.75rem 1.5rem !important; }
        }

        /* Tablet portrait (600px - 900px) */
        @media (max-width: 900px) and (min-width: 601px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          nav { margin: 0.5rem 1rem !important; padding: 0.6rem 1rem !important; }
        }

        /* Mobile large (400px - 600px) */
        @media (max-width: 600px) and (min-width: 401px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          nav { margin: 0.5rem !important; padding: 0.5rem 0.75rem !important; }
        }

        /* Mobile small (below 400px — iPhone SE, Galaxy A) */
        @media (max-width: 400px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          nav { margin: 0.25rem !important; padding: 0.5rem 0.6rem !important; }
          .brand-text { font-size: 16px !important; }
          .mobile-menu { margin: 0 0.25rem 0.5rem !important; }
        }

        /* Touch devices — bigger tap targets */
        @media (hover: none) and (pointer: coarse) {
          .mobile-menu a, .mobile-menu button {
            min-height: 48px !important;
            padding: 14px 16px !important;
          }
        }
      `}</style>
    </>
  );
}

export default Navbar;