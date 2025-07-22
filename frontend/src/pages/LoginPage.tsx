import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AsgardeoAuthContext';
import { HomeIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/hotels';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Please enter a JWT token');
      return;
    }

    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Try to decode the payload
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.sub) {
        throw new Error('Token missing required claims');
      }

      await signIn();
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid JWT token format or missing required claims');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <HomeIcon className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-6 text-3xl font-bold text-secondary-900">
            Welcome to Gardeo Hotels
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Please enter your JWT token to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-secondary-700">
              JWT Token
            </label>
            <textarea
              id="token"
              name="token"
              rows={6}
              className="mt-1 input-field resize-none"
              placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="btn-primary w-full"
            >
              Sign In
            </button>
          </div>

          <div className="text-sm text-secondary-600 bg-secondary-100 p-4 rounded-lg">
            <p className="font-medium mb-2">For testing purposes:</p>
            <p>• The token should be a valid JWT with 'sub' and 'scope' claims</p>
            <p>• Required scopes: read_hotels, read_rooms, create_bookings, read_bookings</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;