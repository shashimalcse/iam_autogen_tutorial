import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { HotelBasic } from '../../types';

interface HotelCardProps {
  hotel: HotelBasic;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon key={`full-${i}`} className="w-4 h-4 text-gold-400 fill-current" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="w-4 h-4 text-gold-200 fill-current" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="w-4 h-4 text-secondary-300 fill-current" />
      );
    }

    return stars;
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-300 group">
      <div className="space-y-4">
        {/* Hotel Image Placeholder */}
        <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
          <span className="text-primary-600 font-semibold text-lg">
            {hotel.name}
          </span>
        </div>

        {/* Hotel Info */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="text-xl font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
              {hotel.name}
            </h3>
            <div className="flex items-center gap-1">
              {renderStars(hotel.rating)}
              <span className="text-sm text-secondary-600 ml-1">
                {hotel.rating}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-secondary-600">
            <MapPinIcon className="w-4 h-4" />
            <span className="text-sm">{hotel.location}</span>
          </div>

          <p className="text-secondary-700 text-sm line-clamp-3">
            {hotel.description}
          </p>

          {/* Room Types */}
          <div className="flex flex-wrap gap-2">
            {hotel.roomTypes.map((roomType) => (
              <span
                key={roomType}
                className="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full"
              >
                {roomType.replace('_', ' ').toLowerCase()}
              </span>
            ))}
          </div>

          <Link
            to={`/hotels/${hotel.id}`}
            className="btn-primary w-full text-center block mt-4"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;