import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AsgardeoAuthContext';
import { hotelAPI } from '../services/api';
import { HotelBasic } from '../types';
import HotelCard from '../components/hotels/HotelCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Layout from '../components/layout/Layout';

const HotelListPage: React.FC = () => {
  const { hasScope } = useAuth();
  const [hotels, setHotels] = useState<HotelBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await hotelAPI.getHotels();
        setHotels(response.data.hotels);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [hasScope]);

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
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-secondary-900">
            Discover Luxury Hotels
          </h1>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Experience the finest accommodations across Sri Lanka with Gardeo Hotels. 
            From pristine beaches to misty mountains, find your perfect getaway.
          </p>
        </div>

        {/* Hotels Grid */}
        {hotels.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary-600">No hotels available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HotelListPage;
