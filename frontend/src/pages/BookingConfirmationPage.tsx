import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircleIcon, CalendarIcon, MapPinIcon, UserIcon } from '@heroicons/react/24/solid';
import { hotelAPI } from '../services/api';
import { Booking } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Layout from '../components/layout/Layout';

const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [booking, setBooking] = useState<Booking | null>(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [error, setError] = useState<string | null>(null);
  const isNewBooking = location.state?.isNew || false;

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id || booking) return;
      
      try {
        setLoading(true);
        const response = await hotelAPI.getBooking(parseInt(id));
        setBooking(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, booking]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !booking) {
    return (
      <Layout>
        <ErrorMessage message={error || 'Booking not found'} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Success Header */}
        {isNewBooking && (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircleIcon className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-secondary-900">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-secondary-600">
              Your reservation has been successfully created.
            </p>
          </div>
        )}

        {!isNewBooking && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-secondary-900">
              Booking Details
            </h1>
          </div>
        )}

        {/* Booking Details Card */}
        <div className="card space-y-6">
          <div className="flex items-center justify-between border-b border-secondary-200 pb-4">
            <h2 className="text-xl font-semibold text-secondary-900">
              Reservation #{booking.id}
            </h2>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Confirmed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hotel Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-secondary-900">Hotel Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-secondary-500" />
                  <span className="font-medium">{booking.hotel_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-secondary-500" />
                  <span className="text-secondary-600">
                    Room {booking.room_id} - {booking.room_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Stay Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-secondary-900">Stay Details</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-secondary-500" />
                  <span className="text-secondary-600">
                    Check-in: {format(new Date(booking.check_in), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-secondary-500" />
                  <span className="text-secondary-600">
                    Check-out: {format(new Date(booking.check_out), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-secondary-500" />
                  <span className="text-secondary-600">
                    {booking.guest_count} Guest{booking.guest_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="border-t border-secondary-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-secondary-900">
                Total Amount
              </span>
              <span className="text-2xl font-bold text-primary-600">
                ${booking.total_price}
              </span>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="card">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Important Information
          </h3>
          <div className="space-y-3 text-sm text-secondary-700">
            <p>• Please arrive at the hotel with a valid photo ID</p>
            <p>• Check-in time is 2:00 PM and check-out is 12:00 PM</p>
            <p>• For any changes or cancellations, please contact the hotel directly</p>
            <p>• A confirmation email has been sent to your registered email address</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/bookings" className="btn-primary flex-1 text-center">
            View All Bookings
          </Link>
          <Link to="/hotels" className="btn-secondary flex-1 text-center">
            Book Another Stay
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default BookingConfirmationPage;