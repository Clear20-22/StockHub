import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Shield, Clock, Users, ArrowRight, ChevronDown } from 'lucide-react';
import { useSmoothScrollToSection } from '../hooks/useSmoothScroll';
import warehouseImage from '../assets/wearhouse profile.webp';

const Home = () => {
  const { scrollToSection } = useSmoothScrollToSection();

  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Comprehensive tracking and management of your warehouse inventory'
    },
    {
      icon: Shield,
      title: 'Secure Storage',
      description: 'State-of-the-art security systems to protect your valuable goods'
    },
    {
      icon: Clock,
      title: '24/7 Access',
      description: 'Round-the-clock access to your stored items and real-time updates'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Professional staff dedicated to managing your warehouse needs'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        id="hero"
        className="relative bg-gradient-to-r from-blue-600/85 to-blue-800/85 text-white py-20 min-h-screen flex items-center transform-gpu will-change-scroll"
        style={{
          backgroundImage: `url(${warehouseImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: 'translate3d(0, 0, 0)'
        }}
      >
        {/* Enhanced overlay for better text readability and color matching */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/60 to-blue-700/70 transform-gpu"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 drop-shadow-2xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Welcome to StockHub
            </h1>
            <p className="text-xl md:text-3xl mb-12 text-blue-100 drop-shadow-lg font-light tracking-wide">
              Your trusted warehouse management solution
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Link
                to="/register"
                className="bg-gradient-to-r from-white to-blue-50 text-blue-700 px-10 py-4 rounded-2xl font-bold hover:from-blue-50 hover:to-white transition-all duration-300 inline-flex items-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 border border-white/20"
              >
                <span className="text-lg">Get Started</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="border-2 border-white/80 text-white px-10 py-4 rounded-2xl font-bold hover:bg-white/10 hover:border-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 backdrop-blur-sm"
              >
                <span className="text-lg">Learn More</span>
              </button>
            </div>
            
            {/* Smooth scroll down indicator */}
            <button
              onClick={() => scrollToSection('features')}
              className="animate-bounce hover:animate-none transition-all duration-300 hover:scale-110"
              aria-label="Scroll to features"
            >
              <ChevronDown className="h-8 w-8 text-white/80 hover:text-white mx-auto" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-800 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 bg-clip-text text-transparent">
              Why Choose StockHub?
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We provide comprehensive warehouse management solutions with cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-8 rounded-3xl bg-white/80 hover:bg-white hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-blue-100/50 hover:border-blue-200 backdrop-blur-sm group"
              >
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white relative overflow-hidden">
        {/* Background decoration matching navbar style */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Ready to Get Started?
          </h2>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Join thousands of businesses that trust StockHub for their warehouse management needs
          </p>
          <Link
            to="/register"
            className="bg-gradient-to-r from-white to-blue-50 text-blue-700 px-12 py-5 rounded-2xl font-bold hover:from-blue-50 hover:to-white transition-all duration-300 inline-flex items-center space-x-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 border border-white/20"
          >
            <span className="text-lg">Sign Up Now</span>
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
