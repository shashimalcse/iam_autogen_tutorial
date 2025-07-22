import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Hotels, Hotel, Booking, BookingCreate } from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get access token from Asgardeo SDK
let getAccessTokenFunction: (() => Promise<string>) | null = null;

export const setAccessTokenFunction = (fn: () => Promise<string>) => {
  getAccessTokenFunction = fn;
};

// Request interceptor to add access token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log('API Request interceptor called for:', config.url);
    
    if (getAccessTokenFunction) {
      try {
        const token = await getAccessTokenFunction();
        console.log('Retrieved access token:', token ? 'Token exists' : 'No token');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Added Authorization header:', config.headers.Authorization?.substring(0, 20) + '...');
        }
      } catch (error) {
        console.error('Failed to get access token:', error);
      }
    } else {
      console.log('No access token function available');
    }
    
    console.log('Final request headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors
      console.error('Unauthorized access:', error);
    }
    return Promise.reject(error);
  }
);

// API methods
export const hotelAPI = {
  // Get all hotels
  getHotels: (): Promise<AxiosResponse<Hotels>> => 
    api.get('/hotels'),

  // Get hotel by ID
  getHotel: (hotelId: number): Promise<AxiosResponse<Hotel>> => 
    api.get(`/hotels/${hotelId}`),

  // Create booking
  createBooking: (bookingData: BookingCreate): Promise<AxiosResponse<Booking>> => 
    api.post('/bookings', bookingData),

  // Get booking details
  getBooking: (bookingId: number): Promise<AxiosResponse<Booking>> => 
    api.get(`/bookings/${bookingId}`),

  // Get user bookings
  getUserBookings: (userId: string): Promise<AxiosResponse<Booking[]>> => 
    api.get(`/users/${userId}/bookings`),
};

export default api;