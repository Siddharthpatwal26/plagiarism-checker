import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setGoogleAuth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const id = params.get('id');

    if (token && name) {
      setGoogleAuth(token, { id, name, email });
      toast.success(`Welcome, ${name}!`);
      navigate('/');
    } else {
      toast.error('Authentication failed');
      navigate('/login');
    }
  }, [location, navigate, setGoogleAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 text-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-text-secondary mt-2">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
