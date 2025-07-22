import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AsgardeoAuthContext';
import { hotelAPI } from '../services/api';
import { Booking } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Layout from '../components/layout/Layout';

const BookingsPage: React.FC = () => {
  const { user, hasScope } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.sub) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await hotelAPI.getUserBookings(user.sub);
        setBookings(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, hasScope]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorMessage message={error} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">
              My Bookings
            </h1>
            <p className="text-secondary-600 mt-1">
              Manage your hotel reservations
            </p>
          </div>
          <Link to="/hotels" className="btn-primary">
            Book New Stay
          </Link>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="space-y-4">
              <CalendarIcon className="w-16 h-16 text-secondary-300 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-secondary-900">
                  No bookings yet
                </h3>
                <p className="text-secondary-600">
                  Start planning your next getaway!
                </p>
              </div>
              <Link to="/hotels" className="btn-primary">
                Explore Hotels
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-secondary-900">
                          {booking.hotel_name}
                        </h3>
                        <p className="text-secondary-600">
                          Room {booking.room_id} - {booking.room_type.replace('_', ' ')}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Confirmed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-secondary-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-sm">
                          {format(new Date(booking.check_in), 'MMM dd')} - {' '}
                          {format(new Date(booking.check_out), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-secondary-600">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="text-sm">Booking #{booking.id}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-primary-600">
                        ${booking.total_price}
                      </span>
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <EyeIcon className="w-4 h-4" />
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BookingsPage;
