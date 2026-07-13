import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="relative">
          {/* Subtle spinning accent */}
          <div className="w-16 h-16 rounded-full border-t-2 border-primary-500 border-r-2 border-transparent animate-spin"></div>
          {/* Pulsing inner dot */}
          <div className="w-8 h-8 rounded-full bg-secondary-500 absolute top-4 left-4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
