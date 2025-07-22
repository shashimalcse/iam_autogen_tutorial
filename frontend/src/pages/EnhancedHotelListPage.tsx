import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AsgardeoAuthContext';
import { hotelAPI } from '../services/api';
import { HotelBasic, BookingPreferences } from '../types';
import EnhancedHotelCard from '../components/hotels/EnhancedHotelCard';
import SearchBar from '../components/common/SearchBar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Layout from '../components/layout/Layout';
import { 
  FunnelIcon, 
  Squares2X2Icon, 
  ListBulletIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const EnhancedHotelListPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const [hotels, setHotels] = useState<HotelBasic[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<HotelBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchPreferences, setSearchPreferences] = useState<BookingPreferences | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'location'>('rating');
  const [filterByLocation, setFilterByLocation] = useState<string>('all');

  // Check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching hotels...');
        const response = await hotelAPI.getHotels();
        console.log('Hotels response:', response);
        setHotels(response.data.hotels);
        setFilteredHotels(response.data.hotels);
      } catch (err: any) {
        console.error('Hotel fetch error:', err);
        setError(err.response?.data?.detail || 'Failed to load hotels');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchHotels();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let filtered = [...hotels];

    // Filter by location
    if (filterByLocation !== 'all') {
      filtered = filtered.filter(hotel => 
        hotel.location.toLowerCase().includes(filterByLocation.toLowerCase())
      );
    }

    // Sort hotels
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });

    setFilteredHotels(filtered);
  }, [hotels, sortBy, filterByLocation]);

  const handleSearch = (preferences: BookingPreferences) => {
    setSearchPreferences(preferences);
    // You could add additional filtering based on search preferences here
  };

  const uniqueLocations = Array.from(new Set(hotels.map(hotel => 
    hotel.location.split(',')[0].trim()
  )));

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
        {/* Hero Section with Search */}
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-secondary-900">
              Find Your Perfect Stay
            </h1>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Discover luxury accommodations across Sri Lanka's most beautiful destinations
            </p>
          </div>
          
          <SearchBar onSearch={handleSearch} className="max-w-4xl mx-auto" />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* Location Filter */}
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-secondary-500" />
              <select
                value={filterByLocation}
                onChange={(e) => setFilterByLocation(e.target.value)}
                className="text-sm border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Locations</option>
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-secondary-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'name' | 'location')}
                className="text-sm border border-secondary-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
                <option value="location">Sort by Location</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Results Count */}
            <span className="text-sm text-secondary-600">
              {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''} found
            </span>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-secondary-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-secondary-600 hover:bg-secondary-50'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-secondary-600 hover:bg-secondary-50'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Hotels Display */}
        {filteredHotels.length === 0 ? (
          <div className="text-center py-12">
            <div className="space-y-4">
              <MapIcon className="w-16 h-16 text-secondary-300 mx-auto" />
              <div>
                <h3 className="text-lg font-medium text-secondary-900">
                  No hotels found
                </h3>
                <p className="text-secondary-600">
                  Try adjusting your filters or search criteria
                </p>
              </div>
              <button
                onClick={() => {
                  setFilterByLocation('all');
                  setSortBy('rating');
                }}
                className="btn-primary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div 
            className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-6'
            }
          >
            {filteredHotels.map((hotel) => (
              <EnhancedHotelCard 
                key={hotel.id} 
                hotel={hotel} 
                searchPreferences={searchPreferences || undefined}
              />
            ))}
          </div>
        )}

        {/* Load More Button (for future pagination) */}
        {filteredHotels.length > 0 && (
          <div className="text-center pt-8">
            <p className="text-secondary-600 text-sm">
              Showing all available hotels
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EnhancedHotelListPage;
