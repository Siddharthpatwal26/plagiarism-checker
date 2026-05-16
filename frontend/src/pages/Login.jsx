import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiArrowRight, FiChevronRight, FiSmartphone, FiShield } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaApple } from 'react-icons/fa';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const isDark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let result;
    if (isLogin) {
      result = await login({ email, password });
    } else {
      result = await register({ name, email, password });
    }

    if (result && result.success) {
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const handleSocialPlaceholder = (provider) => {
    alert(`${provider} login is coming soon! For now, please use Google or Email.`);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isDark ? 'bg-[#060b18]' : 'bg-[#f8fafc]'}`}>
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 ${isDark ? 'bg-primary' : 'bg-blue-400'} animate-pulse`} />
        <div className={`absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 ${isDark ? 'bg-purple-600' : 'bg-purple-300'} animate-pulse`} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative z-10 w-full max-w-[520px] ${isDark ? 'bg-[#0f172a]/80 border-white/10' : 'bg-white border-slate-100'} border backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden`}
      >
        <div className="p-8 lg:p-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {isLogin ? 'Sign in' : 'Sign up'}
            </h2>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className={`text-sm font-medium ${isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'} transition-colors underline underline-offset-4 bg-transparent`}
            >
              {isLogin ? "I don't have an account" : "I already have an account"}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1"
                >
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full px-5 py-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-lg`}
                    required={!isLogin}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1">
              <input 
                type="email" 
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-lg`}
                required
              />
            </div>

            <div className="space-y-1">
              <input 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'} outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-lg`}
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Continue'
              )}
            </button>
          </form>

          <div className="text-center mb-8">
            <button className={`text-sm font-medium ${isDark ? 'text-teal-400 hover:text-teal-300' : 'text-teal-600 hover:text-teal-700'} hover:underline bg-transparent`}>Can't sign In?</button>
          </div>

          {/* Social Logins */}
          <div className="space-y-3">
            <SocialButton 
              icon={<FcGoogle size={20} />} 
              text="Sign In with Google" 
              onClick={handleGoogleLogin}
              isDark={isDark}
            />
            <SocialButton 
              icon={<FaFacebook size={20} className="text-[#1877F2]" />} 
              text="Sign in with Facebook" 
              onClick={() => handleSocialPlaceholder('Facebook')}
              isDark={isDark}
            />
            <SocialButton 
              icon={<FaApple size={20} className={isDark ? 'text-white' : 'text-black'} />} 
              text="Sign in with Apple" 
              onClick={() => handleSocialPlaceholder('Apple')}
              isDark={isDark}
            />
            <SocialButton 
              icon={<FiSmartphone size={20} className="text-teal-600" />} 
              text="Sign in with Phone Number" 
              onClick={() => handleSocialPlaceholder('Phone Number')}
              isDark={isDark}
            />
          </div>

          {/* Footer */}
          <div className="mt-10 text-[11px] leading-relaxed text-center text-slate-500">
            <p className="mb-2">
              This site is protected by reCAPTCHA and the Google <span className="underline cursor-pointer">Privacy Policy</span> and <span className="underline cursor-pointer">Terms of Service</span> apply.
            </p>
            <div className="flex justify-center gap-3">
              <span className="underline cursor-pointer">Terms and Conditions</span>
              <span className="underline cursor-pointer">Privacy Policy</span>
              <span className="underline cursor-pointer">CA Notice at Collection</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SocialButton = ({ icon, text, onClick, isDark }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all group ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{text}</span>
    </div>
    <FiChevronRight className={`text-slate-400 group-hover:translate-x-1 transition-transform`} />
  </button>
);

export default Login;
