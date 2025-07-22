import React from 'react';
import { UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { RoomBasic } from '../../types';

interface RoomCardProps {
  room: RoomBasic;
  onSelect: (room: RoomBasic) => void;
  isSelected?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect, isSelected = false }) => {
  return (
    <div 
      className={`card cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-primary-500 bg-primary-50' 
          : 'hover:shadow-md'
      } ${!room.is_available ? 'opacity-60' : ''}`}
      onClick={() => room.is_available && onSelect(room)}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">
              Room {room.room_number}
            </h3>
            <p className="text-primary-600 font-medium capitalize">
              {room.room_type.replace('_', ' ')}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-secondary-600">
              <CurrencyDollarIcon className="w-4 h-4" />
              <span className="text-xl font-bold text-secondary-900">
                {room.price_per_night}
              </span>
            </div>
            <p className="text-sm text-secondary-500">per night</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-secondary-600">
            <UserIcon className="w-4 h-4" />
            <span className="text-sm">Up to {room.occupancy} guests</span>
          </div>
          
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            room.is_available 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {room.is_available ? 'Available' : 'Unavailable'}
          </div>
        </div>

        {isSelected && (
          <div className="mt-4 p-3 bg-primary-100 rounded-lg">
            <p className="text-sm text-primary-800 font-medium">
              Selected for booking
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;