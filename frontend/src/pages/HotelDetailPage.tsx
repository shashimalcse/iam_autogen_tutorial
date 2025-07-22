import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StarIcon, MapPinIcon, CheckIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AsgardeoAuthContext';
import { hotelAPI } from '../services/api';
import { Hotel, RoomBasic, BookingCreate } from '../types';
import RoomCard from '../components/hotels/RoomCard';
import BookingForm from '../components/booking/BookingForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Layout from '../components/layout/Layout';

const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasScope } = useAuth();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomBasic | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotel = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await hotelAPI.getHotel(parseInt(id));
        setHotel(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id, hasScope]);

  const handleRoomSelect = (room: RoomBasic) => {
    setSelectedRoom(room);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (bookingData: BookingCreate) => {
    try {
      setBookingLoading(true);
      const response = await hotelAPI.createBooking(bookingData);
      
      // Redirect to booking confirmation
      navigate(`/bookings/${response.data.id}`, {
        state: { booking: response.data, isNew: true }
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`w-5 h-5 ${
            i <= rating ? 'text-gold-400' : 'text-secondary-300'
          } fill-current`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (error || !hotel) {
    return (
      <Layout>
        <ErrorMessage message={error || 'Hotel not found'} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Hotel Header */}
        <div className="space-y-4">
          <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
            <span className="text-primary-600 font-bold text-2xl">
              {hotel.name}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-secondary-900">
                {hotel.name}
              </h1>
              <div className="flex items-center gap-2">
                {renderStars(hotel.rating)}
                <span className="text-lg font-medium text-secondary-700">
                  {hotel.rating}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-secondary-600">
              <MapPinIcon className="w-5 h-5" />
              <span>{hotel.location}</span>
            </div>
            
            <p className="text-secondary-700 max-w-3xl">
              {hotel.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hotel Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amenities */}
            <div className="card">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Amenities
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hotel.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-secondary-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="card">
              <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                Policies
              </h3>
              <ul className="space-y-2">
                {hotel.policies.map((policy, index) => (
                  <li key={index} className="text-sm text-secondary-700">
                    • {policy}
                  </li>
                ))}
              </ul>
            </div>

            {/* Promotions */}
            {hotel.promotions.length > 0 && (
              <div className="card">
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  Current Promotions
                </h3>
                <div className="space-y-2">
                  {hotel.promotions.map((promotion, index) => (
                    <div key={index} className="bg-gold-50 border border-gold-200 rounded-lg p-3">
                      <span className="text-gold-800 font-medium">{promotion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Rooms */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-secondary-900">
                Available Rooms
              </h3>
              <div className="grid gap-4">
                {hotel.rooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onSelect={handleRoomSelect}
                    isSelected={selectedRoom?.id === room.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            {showBookingForm && selectedRoom ? (
              <div className="sticky top-8">
                <BookingForm
                  room={selectedRoom}
                  hotelId={hotel.id}
                  hotelName={hotel.name}
                  onSubmit={handleBookingSubmit}
                  onCancel={() => {
                    setShowBookingForm(false);
                    setSelectedRoom(null);
                  }}
                  isLoading={bookingLoading}
                />
              </div>
            ) : (
              <div className="card sticky top-8">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Ready to Book?
                </h3>
                <p className="text-secondary-600 mb-4">
                  Select a room to start your booking process.
                </p>
                <div className="text-sm text-secondary-500">
                  All rooms include modern amenities and complimentary services.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HotelDetailPage;
