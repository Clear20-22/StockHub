import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Shield, Clock, Users, ArrowRight } from 'lucide-react';

const Home = () => {
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
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to StockHub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your trusted warehouse management solution
            </p>
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose StockHub?
            </h2>
            <p className="text-xl text-gray-600">
              We provide comprehensive warehouse management solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses that trust StockHub for their warehouse needs
          </p>
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <span>Sign Up Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
