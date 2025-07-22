import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AsgardeoAuthContext';
import { UserIcon, HomeIcon } from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { isAuthenticated, user, signIn, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <HomeIcon className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-secondary-900">
              Gardeo Hotels
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/hotels" 
                  className="text-secondary-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Hotels
                </Link>
                <Link 
                  to="/bookings" 
                  className="text-secondary-700 hover:text-primary-600 font-medium transition-colors"
                >
                  My Bookings
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-secondary-600">
                    <UserIcon className="w-5 h-5" />
                    <span className="text-sm">
                      {user?.username || user?.given_name || user?.sub}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button className="btn-primary" onClick={signIn}>
                Login
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
