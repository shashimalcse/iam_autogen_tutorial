import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, CalendarIcon, UserGroupIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';
import { SearchParams } from '../../types';
import { hotelAPI } from '../../services/api';

interface SearchBarProps {
  onSearch?: (searchParams: SearchParams) => void;
  className?: string;
  showDestination?: boolean;
  initialDestination?: string;
  variant?: 'home' | 'hotels'; // 'home' for homepage with yellow border, 'hotels' for hotel list page
  navigateToResults?: boolean; // Whether to navigate to results page or use callback
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  className = '', 
  showDestination = true,
  initialDestination = '',
  variant = 'hotels',
  navigateToResults = false
}) => {
  const [destination, setDestination] = useState(initialDestination);
  const [checkIn, setCheckIn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showDestination && !destination.trim()) {
      alert('Please enter a destination');
      return;
    }

    const searchParams: SearchParams = {
      location: destination.trim(),
      check_in: checkIn,
      check_out: checkOut,
      guests,
      rooms
    };

    if (navigateToResults) {
      // Home page behavior: call API and navigate
      setIsSearching(true);
      try {
        const response = await hotelAPI.searchHotels(searchParams);
        const results = response.data;

        // Navigate to hotels page with search results in state
        navigate('/hotels', {
          state: {
            searchResults: results,
            searchParams: searchParams,
            isSearchResults: true
          }
        });
      } catch (error) {
        console.error('Search failed:', error);
        alert('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    } else {
      // Hotel list page behavior: use callback
      onSearch?.(searchParams);
    }
  };

  const containerClass = variant === 'home' 
    ? `bg-yellow-400 p-1 rounded-lg shadow-lg ${className}`
    : `bg-white rounded-lg shadow-lg border border-gray-200 p-6 ${className}`;

  const innerClass = variant === 'home' 
    ? 'bg-white rounded-lg p-6'
    : '';

  return (
    <div className={containerClass}>
      <div className={innerClass}>
        <form onSubmit={handleSearch} className={`grid gap-4 items-end ${
          showDestination 
            ? 'grid-cols-1 md:grid-cols-5' 
            : 'grid-cols-1 md:grid-cols-4'
        }`}>
        
        {/* Destination */}
        {showDestination && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Where are you going?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        )}

        {/* Check-in */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-in
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Check-out
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Guests & Rooms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Guests & Rooms
          </label>
          <div className="relative">
            <UserGroupIcon className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <select
              value={`${guests}-${rooms}`}
              onChange={(e) => {
                const [g, r] = e.target.value.split('-').map(Number);
                setGuests(g);
                setRooms(r);
              }}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1-1">1 Guest • 1 Room</option>
              <option value="2-1">2 Guests • 1 Room</option>
              <option value="3-1">3 Guests • 1 Room</option>
              <option value="4-1">4 Guests • 1 Room</option>
              <option value="2-2">2 Guests • 2 Rooms</option>
              <option value="4-2">4 Guests • 2 Rooms</option>
              <option value="6-2">6 Guests • 2 Rooms</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={isSearching}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          {isSearching ? 'Searching...' : 'Search'}
        </button>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;
