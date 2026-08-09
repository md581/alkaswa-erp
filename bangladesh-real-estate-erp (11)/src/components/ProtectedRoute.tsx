import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { RoleId } from '../types';
import ClearanceErrorScreen from './ClearanceErrorScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RoleId[];
  activeView: string;
  lang: 'en' | 'bn';
  onAccessDeniedRedirect: () => void;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  activeView,
  lang,
  onAccessDeniedRedirect,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-6 bg-slate-50">
        {/* Animated premium skeleton loaders */}
        <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <div className="space-y-3 text-center">
          <p className="text-sm font-semibold text-slate-800 animate-pulse">
            {lang === 'en' ? 'Verifying Corporate Credentials...' : 'কর্পোরেট শংসাপত্র যাচাই করা হচ্ছে...'}
          </p>
          <p className="text-xs text-slate-400">
            {lang === 'en' ? 'Establishing secure session node with database' : 'ডাটাবেসের সাথে নিরাপদ সেশন নোড স্থাপন করা হচ্ছে'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // If not authenticated, the App component will handle showing the LoginPage.
    // However, just in case, we return null or empty to prevent layout flashes.
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <ClearanceErrorScreen
        lang={lang}
        currentRole={user.role}
        activeView={activeView}
        onRedirect={onAccessDeniedRedirect}
      />
    );
  }

  return <>{children}</>;
}
