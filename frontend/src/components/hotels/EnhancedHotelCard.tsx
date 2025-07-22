import React from 'react';
import { Link } from 'react-router-dom';
import { 
  StarIcon, 
  MapPinIcon, 
  WifiIcon,
  TruckIcon
} from '@heroicons/react/24/solid';
import { 
  HeartIcon,
  ShareIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { HotelBasic } from '../../types';

interface EnhancedHotelCardProps {
  hotel: HotelBasic;
  searchPreferences?: {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };
}

const EnhancedHotelCard: React.FC<EnhancedHotelCardProps> = ({ 
  hotel, 
  searchPreferences 
}) => {
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

  const getAmenityIcon = (amenity: string) => {
    const icons = {
      'wifi': WifiIcon,
      'pool': WifiIcon, // Using WifiIcon as placeholder
      'parking': TruckIcon,
    };
    
    const IconComponent = icons[amenity as keyof typeof icons];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const buildViewLink = () => {
    const params = new URLSearchParams();
    if (searchPreferences?.checkIn) params.set('checkIn', searchPreferences.checkIn);
    if (searchPreferences?.checkOut) params.set('checkOut', searchPreferences.checkOut);
    if (searchPreferences?.guests) params.set('guests', searchPreferences.guests.toString());
    
    return `/hotels/${hotel.id}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative">
        <div className="w-full h-56 bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <MapPinIcon className="w-8 h-8 text-white" />
            </div>
            <span className="text-white font-bold text-lg drop-shadow-lg">
              {hotel.name}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors">
            <HeartIcon className="w-4 h-4 text-secondary-600" />
          </button>
          <button className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors">
            <ShareIcon className="w-4 h-4 text-secondary-600" />
          </button>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
            <StarIcon className="w-4 h-4 text-gold-400" />
            <span className="font-semibold text-sm">{hotel.rating}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {hotel.name}
          </h3>
          
          <div className="flex items-center gap-2 text-secondary-600">
            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{hotel.location}</span>
          </div>

          <div className="flex items-center gap-1">
            {renderStars(hotel.rating)}
            <span className="text-sm text-secondary-600 ml-1">
              ({hotel.rating}/5)
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-secondary-700 text-sm line-clamp-3 leading-relaxed">
          {hotel.description}
        </p>

        {/* Room Types */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-secondary-900">Available Room Types</h4>
          <div className="flex flex-wrap gap-2">
            {hotel.roomTypes.map((roomType, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-200"
              >
                {roomType.replace('_', ' ').toLowerCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link
            to={buildViewLink()}
            className="btn-primary w-full text-center flex items-center justify-center gap-2 group"
          >
            <EyeIcon className="w-4 h-4" />
            View Details & Book
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnhancedHotelCard;