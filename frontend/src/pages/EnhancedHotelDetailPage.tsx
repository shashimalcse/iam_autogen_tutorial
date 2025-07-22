import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { StarIcon, MapPinIcon, CheckIcon, WifiIcon, TruckIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AsgardeoAuthContext';
import { hotelAPI } from '../services/api';
import { Hotel, RoomBasic, BookingCreate } from '../types';
import EnhancedRoomCard from '../components/hotels/EnhancedRoomCard';
import EnhancedBookingForm from '../components/booking/EnhancedBookingForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Layout from '../components/layout/Layout';

const EnhancedHotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<RoomBasic | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get search parameters
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

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

    if (isAuthenticated) {
      fetchHotel();
    }
  }, [id, isAuthenticated]);

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

  const getAmenityIcon = (amenity: string) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) {
      return <WifiIcon className="w-5 h-5 text-primary-600" />;
    }
    if (amenityLower.includes('parking') || amenityLower.includes('car')) {
      return <TruckIcon className="w-5 h-5 text-primary-600" />;
    }
    return <CheckIcon className="w-5 h-5 text-green-600" />;
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

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
        <div className="space-y-4">
          <button
            onClick={() => navigate('/hotels')}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Hotels
          </button>
          <ErrorMessage message={error || 'Hotel not found'} />
        </div>
      </Layout>
    );
  }

  const availableRooms = hotel.rooms.filter(room => room.is_available);
  const unavailableRooms = hotel.rooms.filter(room => !room.is_available);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Navigation */}
        <button
          onClick={() => navigate('/hotels')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Hotels
        </button>

        {/* Hotel Header */}
        <div className="space-y-6">
          {/* Hero Image */}
          <div className="relative w-full h-80 bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 rounded-xl overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <MapPinIcon className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-bold drop-shadow-lg">{hotel.name}</h1>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3">
              <button className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors">
                <HeartIcon className="w-5 h-5 text-secondary-600" />
              </button>
              <button className="p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-colors">
                <ShareIcon className="w-5 h-5 text-secondary-600" />
              </button>
            </div>
          </div>
          
          {/* Hotel Info */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-secondary-900">
                  {hotel.name}
                </h1>
                
                <div className="flex items-center gap-2 text-secondary-600">
                  <MapPinIcon className="w-5 h-5" />
                  <span className="text-lg">{hotel.location}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStars(hotel.rating)}
                  </div>
                  <span className="text-lg font-semibold text-secondary-700">
                    {hotel.rating}/5
                  </span>
                  <span className="text-sm text-secondary-500">
                    (Based on guest reviews)
                  </span>
                </div>
              </div>

              {checkIn && checkOut && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h4 className="font-semibold text-primary-900 mb-2">Your Search</h4>
                  <div className="text-sm text-primary-700 space-y-1">
                    <p>Check-in: {checkIn}</p>
                    <p>Check-out: {checkOut}</p>
                    {guests && <p>Guests: {guests}</p>}
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-secondary-700 text-lg max-w-4xl leading-relaxed">
              {hotel.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Amenities */}
            <div className="card">
              <h3 className="text-2xl font-bold text-secondary-900 mb-6">
                Hotel Amenities
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotel.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                    {getAmenityIcon(amenity)}
                    <span className="text-secondary-700 font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="card">
              <h3 className="text-2xl font-bold text-secondary-900 mb-6">
                Hotel Policies
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotel.policies.map((policy, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg">
                    <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-secondary-700">{policy}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Promotions */}
            {hotel.promotions.length > 0 && (
              <div className="card">
                <h3 className="text-2xl font-bold text-secondary-900 mb-6">
                  Special Offers
                </h3>
                <div className="space-y-3">
                  {hotel.promotions.map((promotion, index) => (
                    <div key={index} className="bg-gradient-to-r from-gold-50 to-gold-100 border border-gold-200 rounded-lg p-4">
                      <span className="text-gold-800 font-semibold text-lg">{promotion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Available Rooms */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-secondary-900">
                  Available Rooms
                </h3>
                <span className="text-sm text-secondary-600">
                  {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
                </span>
              </div>
              
              <div className="space-y-4">
                {availableRooms.map((room) => (
                  <EnhancedRoomCard
                    key={room.id}
                    room={room}
                    onSelect={handleRoomSelect}
                    isSelected={selectedRoom?.id === room.id}
                    checkIn={checkIn || undefined}
                    checkOut={checkOut || undefined}
                  />
                ))}

                {unavailableRooms.length > 0 && (
                  <details className="mt-6">
                    <summary className="cursor-pointer text-secondary-600 font-medium">
                      View {unavailableRooms.length} unavailable room{unavailableRooms.length !== 1 ? 's' : ''}
                    </summary>
                    <div className="mt-4 space-y-4">
                      {unavailableRooms.map((room) => (
                        <EnhancedRoomCard
                          key={room.id}
                          room={room}
                          onSelect={() => {}}
                          checkIn={checkIn || undefined}
                          checkOut={checkOut || undefined}
                        />
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="xl:col-span-1">
            {showBookingForm && selectedRoom ? (
              <div className="sticky top-8">
                <EnhancedBookingForm
                  room={selectedRoom}
                  hotelId={hotel.id}
                  hotelName={hotel.name}
                  onSubmit={handleBookingSubmit}
                  onCancel={() => {
                    setShowBookingForm(false);
                    setSelectedRoom(null);
                  }}
                  isLoading={bookingLoading}
                  initialCheckIn={checkIn || undefined}
                  initialCheckOut={checkOut || undefined}
                />
              </div>
            ) : (
              <div className="card sticky top-8">
                <h3 className="text-xl font-bold text-secondary-900 mb-4">
                  Ready to Book?
                </h3>
                <div className="space-y-4">
                  <p className="text-secondary-600">
                    Select an available room to start your booking process.
                  </p>
                  <div className="space-y-2 text-sm text-secondary-600">
                    <p>✓ Instant confirmation</p>
                    <p>✓ Secure payment</p>
                    <p>✓ Free cancellation</p>
                    <p>✓ 24/7 customer support</p>
                  </div>
                  {availableRooms.length === 0 && (
                    <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
                      <p className="text-secondary-700 font-medium">
                        No rooms currently available
                      </p>
                      <p className="text-secondary-600 text-sm mt-1">
                        Try different dates or contact the hotel directly
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EnhancedHotelDetailPage;
