import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AsgardeoAuthContext';
import { StarIcon, MapPinIcon, CameraIcon } from '@heroicons/react/24/solid';
import Layout from '../components/layout/Layout';
import ChatComponent from '../components/common/ChatComponent';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { signIn } = useAuth();

  const featuredHotels = [
    {
      name: 'Gardeo Saman Villa',
      location: 'Bentota, Sri Lanka',
      rating: 4.5,
      image: 'Beach Resort',
    },
    {
      name: 'Gardeo Colombo Seven',
      location: 'Colombo 07, Sri Lanka',
      rating: 4.9,
      image: 'City Hotel',
    },
    {
      name: 'Gardeo Kandy Hills',
      location: 'Kandy, Sri Lanka',
      rating: 4.7,
      image: 'Mountain Resort',
    },
  ];

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-secondary-900">
              Experience Luxury
              <span className="block text-primary-600">Across Sri Lanka</span>
            </h1>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Discover extraordinary accommodations from pristine beaches to misty mountains. 
              Gardeo Hotels offers unparalleled luxury and authentic Sri Lankan hospitality.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/hotels" className="btn-primary text-lg px-8 py-3">
                Explore Hotels
              </Link>
            ) : (
              <>
                <button className="btn-primary text-lg px-8 py-3" onClick={signIn}>
                  Sign In to Book
                </button>
                <Link to="/hotels" className="btn-secondary text-lg px-8 py-3">
                  Browse Hotels
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Featured Hotels */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-secondary-900">
              Featured Properties
            </h2>
            <p className="text-secondary-600 mt-2">
              Handpicked luxury accommodations for unforgettable experiences
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredHotels.map((hotel, index) => (
              <div
                key={index}
                className="card hover:shadow-xl transition-all duration-300 group"
              >
                <div className="space-y-4">
                  <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-300 transition-all duration-300">
                    <div className="text-center">
                      <CameraIcon className="w-12 h-12 text-primary-600 mx-auto mb-2" />
                      <span className="text-primary-700 font-semibold">
                        {hotel.image}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                      {hotel.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-secondary-600">
                        <MapPinIcon className="w-4 h-4" />
                        <span className="text-sm">{hotel.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-gold-400" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <StarIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900">
              Luxury Amenities
            </h3>
            <p className="text-secondary-600">
              World-class facilities including infinity pools, spas, and fine dining restaurants
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <MapPinIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900">
              Prime Locations
            </h3>
            <p className="text-secondary-600">
              Strategically located properties offering the best of Sri Lankan landscapes
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <CameraIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold text-secondary-900">
              Authentic Experiences
            </h3>
            <p className="text-secondary-600">
              Immerse yourself in local culture with curated experiences and activities
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready for Your Sri Lankan Adventure?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of travelers who have experienced luxury with Gardeo Hotels
          </p>
          <Link to={isAuthenticated ? "/hotels" : "/login"} className="bg-white text-primary-600 hover:bg-secondary-50 font-semibold py-3 px-8 rounded-lg transition-colors">
            {isAuthenticated ? "Book Your Stay" : "Get Started"}
          </Link>
        </div>
      </div>
      
      {/* Chat Component */}
      <ChatComponent />
    </Layout>
  );
};

export default HomePage;
