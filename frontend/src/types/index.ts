// API Response Types
export interface HotelBasic {
  id: number;
  name: string;
  description: string;
  location: string;
  rating: number;
  roomTypes: string[];
}

export interface Hotels {
  hotels: HotelBasic[];
}

export interface RoomBasic {
  id: number;
  room_number: string;
  room_type: string;
  price_per_night: number;
  occupancy: number;
  is_available: boolean;
  amenities?: string[];
  cancellationPolicy?: string;
}

export interface Hotel {
  id: number;
  name: string;
  description: string;
  location: string;
  rating: number;
  amenities: string[];
  policies: string[];
  roomTypes: string[];
  promotions: string[];
  rooms: RoomBasic[];
}

// Enhanced UI Types
export interface SearchFilters {
  location?: string;
  priceRange?: [number, number];
  rating?: number;
  roomType?: string;
  amenities?: string[];
}

export interface BookingPreferences {
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface BookingRequest extends BookingCreate {
  guestName?: string;
  guestEmail?: string;
  specialRequests?: string;
}

export interface BookingCreate {
  hotel_id: number;
  room_id: number;
  check_in: string; // ISO date string
  check_out: string; // ISO date string
  guest_count: number;
}

export interface Booking {
  id: number;
  user_id: string;
  hotel_id: number;
  hotel_name: string;
  room_id: number;
  room_type: string;
  check_in: string;
  check_out: string;
  guest_count: number;
  total_price: number;
}

// Auth Types (Asgardeo-compatible)
export interface User {
  sub: string;
  username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  scopes?: string[];
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  hasScope: (scope: string) => boolean;
}

// Component Props Types
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ErrorMessageProps {
  message: string;
  className?: string;
}

// API Error Type
export interface APIError {
  message: string;
  status: number;
  details?: string;
}