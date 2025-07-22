import React, { useState } from 'react';
import { MagnifyingGlassIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { format, addDays } from 'date-fns';
import { BookingPreferences } from '../../types';

interface SearchBarProps {
  onSearch: (preferences: BookingPreferences) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = '' }) => {
  const [checkIn, setCheckIn] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [guests, setGuests] = useState(2);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ checkIn, checkOut, guests });
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-secondary-200 p-6 ${className}`}>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Check-in */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Check-in
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-secondary-400" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Check-out
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-3 w-4 h-4 text-secondary-400" />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn}
              className="input-field pl-10"
              required
            />
          </div>
        </div>

        {/* Guests */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Guests
          </label>
          <div className="relative">
            <UserGroupIcon className="absolute left-3 top-3 w-4 h-4 text-secondary-400" />
            <select
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value))}
              className="input-field pl-10"
            >
              {[1, 2, 3, 4, 5, 6].map(num => (
                <option key={num} value={num}>
                  {num} Guest{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="btn-primary flex items-center justify-center gap-2 h-11"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;