import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AsgardeoAuthContext';
import { HomeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AsgardeoLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, signIn } = useAuth();

  const from = location.state?.from?.pathname || '/hotels';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">
            Redirecting...
          </h2>
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-secondary-200 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-primary-100 rounded-full">
                <HomeIcon className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                Welcome to Gardeo Hotels
              </h1>
              <p className="text-secondary-600 mt-2">
                Sign in to access your personalized hotel booking experience
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-secondary-700">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Browse luxury hotels across Sri Lanka</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-secondary-700">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Make instant reservations</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-secondary-700">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Manage your bookings</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-secondary-700">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>Secure and trusted platform</span>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              className="w-full btn-primary flex items-center justify-center gap-3 py-3 text-lg font-semibold"
            >
              Sign In with Asgardeo
              <ArrowRightIcon className="w-5 h-5" />
            </button>
            
            <p className="text-xs text-secondary-500 text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          {/* Info Section */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h4 className="font-medium text-primary-900 mb-2">
              Secure Authentication
            </h4>
            <p className="text-sm text-primary-700">
              We use Asgardeo's secure OIDC authentication to protect your account. 
              Your credentials are never stored on our servers.
            </p>
          </div>
        </div>

        {/* Alternative Actions */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-secondary-600 hover:text-primary-600 font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AsgardeoLoginPage;