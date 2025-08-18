import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Shield, Clock, Users, ArrowRight, ChevronDown, Mail, Phone, MapPin, Send, Building2, Target, Heart, Award } from 'lucide-react';
import { useSmoothScrollToSection } from '../hooks/useSmoothScroll';
import warehouseImage from '../assets/wearhouse profile.webp';

const Home = () => {
  const { scrollToSection } = useSmoothScrollToSection();
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

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

  const branches = [
    {
      name: 'Downtown Warehouse',
      address: '123 Industrial Ave, Downtown',
      phone: '+1 (555) 123-4567',
      email: 'downtown@stockhub.com',
      capacity: '10,000 sq ft',
      specialization: 'General Storage'
    },
    {
      name: 'Port District Hub',
      address: '456 Harbor Blvd, Port District',
      phone: '+1 (555) 234-5678',
      email: 'port@stockhub.com',
      capacity: '25,000 sq ft',
      specialization: 'Import/Export'
    },
    {
      name: 'Tech Valley Center',
      address: '789 Innovation Dr, Tech Valley',
      phone: '+1 (555) 345-6789',
      email: 'tech@stockhub.com',
      capacity: '15,000 sq ft',
      specialization: 'Electronics & Tech'
    },
    {
      name: 'Industrial Zone',
      address: '321 Manufacturing Rd, Industrial Zone',
      phone: '+1 (555) 456-7890',
      email: 'industrial@stockhub.com',
      capacity: '35,000 sq ft',
      specialization: 'Heavy Equipment'
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your message! We will get back to you soon.');
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

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
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/50 to-white relative overflow-hidden">
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

      {/* About Section */}
      <section id="about" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-20 w-72 h-72 bg-indigo-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 bg-clip-text text-transparent">
                About StockHub
              </h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                <p>
                  StockHub is a comprehensive warehouse management system designed to help businesses 
                  efficiently manage their inventory, track goods, and streamline their logistics operations.
                </p>
                <p>
                  With state-of-the-art facilities and cutting-edge technology, we provide secure, 
                  reliable, and cost-effective storage solutions for businesses of all sizes.
                </p>
              </div>
              
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <Target className="h-8 w-8 text-blue-600 mr-3" />
                  Our Mission
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  To revolutionize warehouse management through innovative technology and exceptional service, 
                  helping businesses optimize their supply chain operations.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Heart className="h-8 w-8 text-blue-600 mr-3" />
                Our Values
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: Shield, title: 'Security & Reliability', description: 'Your goods are safe with our advanced security systems' },
                  { icon: Award, title: 'Innovation & Technology', description: 'Cutting-edge solutions for modern businesses' },
                  { icon: Users, title: 'Customer Satisfaction', description: 'Your success is our top priority' },
                  { icon: Package, title: 'Transparency & Trust', description: 'Clear communication and honest practices' }
                ].map((value, index) => (
                  <div key={value.title} className="bg-blue-50 rounded-2xl p-6 hover:bg-blue-100 transition-colors group">
                    <value.icon className="h-8 w-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-sm text-gray-600">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section id="branches" className="py-24 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-96 h-96 bg-indigo-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 bg-clip-text text-transparent">
              Our Branches
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Strategically located warehouses to serve you better
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {branches.map((branch, index) => (
              <div key={branch.name} className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-blue-100 group">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-blue-800 transition-colors">
                  {branch.name}
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{branch.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-600">{branch.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-600">{branch.email}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                        {branch.capacity}
                      </span>
                      <p className="text-gray-700 font-medium">{branch.specialization}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-600 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 bg-clip-text text-transparent">
              Contact Us
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get in touch with our team for any inquiries
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-8">Get in Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors group">
                    <div className="bg-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">Email</h4>
                      <p className="text-gray-600">contact@stockhub.com</p>
                      <p className="text-gray-600">support@stockhub.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors group">
                    <div className="bg-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">Phone</h4>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-gray-600">+1 (555) 987-6543</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4 p-6 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors group">
                    <div className="bg-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">Address</h4>
                      <p className="text-gray-600">123 Warehouse District</p>
                      <p className="text-gray-600">Business City, BC 12345</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white">
                <h4 className="text-xl font-bold mb-4">Business Hours</h4>
                <div className="space-y-2 text-blue-100">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Emergency Only</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-blue-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={contactForm.name}
                      onChange={handleContactChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={contactForm.email}
                      onChange={handleContactChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Message subject"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={contactForm.message}
                    onChange={handleContactChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <Send className="h-5 w-5" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
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
