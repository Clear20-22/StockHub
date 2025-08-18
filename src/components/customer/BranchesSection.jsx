import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Star, Navigation, ExternalLink } from 'lucide-react';

const BranchesSection = () => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Sample branch data
  const branches = [
    {
      id: 1,
      name: 'New York Central',
      address: '123 Manhattan Ave, New York, NY 10001',
      phone: '+1 (555) 123-4567',
      email: 'newyork@stockhub.com',
      hours: {
        weekdays: '8:00 AM - 8:00 PM',
        saturday: '9:00 AM - 6:00 PM',
        sunday: '10:00 AM - 4:00 PM'
      },
      rating: 4.8,
      capacity: '85%',
      services: ['Storage', 'Retrieval', '24/7 Access', 'Climate Control'],
      coordinates: { lat: 40.7128, lng: -74.0060 },
      manager: 'Sarah Johnson',
      totalStorage: 5000,
      availableStorage: 750,
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      name: 'Los Angeles West',
      address: '456 Pacific Blvd, Los Angeles, CA 90210',
      phone: '+1 (555) 987-6543',
      email: 'losangeles@stockhub.com',
      hours: {
        weekdays: '7:00 AM - 9:00 PM',
        saturday: '8:00 AM - 7:00 PM',
        sunday: '9:00 AM - 5:00 PM'
      },
      rating: 4.6,
      capacity: '72%',
      services: ['Storage', 'Retrieval', 'Climate Control', 'Security'],
      coordinates: { lat: 34.0522, lng: -118.2437 },
      manager: 'Michael Chen',
      totalStorage: 4500,
      availableStorage: 1260,
      image: '/api/placeholder/300/200'
    },
    {
      id: 3,
      name: 'Chicago Downtown',
      address: '789 Lake Shore Dr, Chicago, IL 60611',
      phone: '+1 (555) 456-7890',
      email: 'chicago@stockhub.com',
      hours: {
        weekdays: '8:00 AM - 7:00 PM',
        saturday: '9:00 AM - 6:00 PM',
        sunday: 'Closed'
      },
      rating: 4.9,
      capacity: '91%',
      services: ['Storage', 'Retrieval', '24/7 Access', 'Climate Control', 'Document Storage'],
      coordinates: { lat: 41.8781, lng: -87.6298 },
      manager: 'Emily Rodriguez',
      totalStorage: 3500,
      availableStorage: 315,
      image: '/api/placeholder/300/200'
    },
    {
      id: 4,
      name: 'Miami Beach',
      address: '321 Ocean Drive, Miami Beach, FL 33139',
      phone: '+1 (555) 234-5678',
      email: 'miami@stockhub.com',
      hours: {
        weekdays: '8:00 AM - 8:00 PM',
        saturday: '9:00 AM - 6:00 PM',
        sunday: '10:00 AM - 4:00 PM'
      },
      rating: 4.7,
      capacity: '68%',
      services: ['Storage', 'Retrieval', 'Climate Control', 'Hurricane Protection'],
      coordinates: { lat: 25.7617, lng: -80.1918 },
      manager: 'Carlos Martinez',
      totalStorage: 2800,
      availableStorage: 896,
      image: '/api/placeholder/300/200'
    }
  ];

  const getCapacityColor = (capacity) => {
    const percent = parseInt(capacity);
    if (percent >= 90) return 'text-red-600 bg-red-100';
    if (percent >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const openInMaps = (branch) => {
    const query = encodeURIComponent(branch.address);
    window.open(`https://maps.google.com/maps?q=${query}`, '_blank');
  };

  const callBranch = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  const emailBranch = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Our Branches</h2>
        </div>
        <div className="text-sm text-gray-500">
          {branches.length} locations nationwide
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
          >
            {/* Branch Image */}
            <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCapacityColor(branch.capacity)}`}>
                  {branch.capacity} Full
                </span>
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{branch.name}</h3>
                <p className="text-sm opacity-90">Managed by {branch.manager}</p>
              </div>
            </div>

            {/* Branch Info */}
            <div className="p-6">
              {/* Rating and Capacity */}
              <div className="flex items-center justify-between mb-4">
                <StarRating rating={branch.rating} />
                <div className="text-sm text-gray-600">
                  {branch.availableStorage.toLocaleString()} / {branch.totalStorage.toLocaleString()} sq ft
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start space-x-3 mb-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-700">{branch.address}</p>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <button
                    onClick={() => callBranch(branch.phone)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {branch.phone}
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <button
                    onClick={() => emailBranch(branch.email)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {branch.email}
                  </button>
                </div>
              </div>

              {/* Hours */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Operating Hours</span>
                </div>
                <div className="text-xs text-gray-600 ml-6 space-y-1">
                  <div>Mon-Fri: {branch.hours.weekdays}</div>
                  <div>Saturday: {branch.hours.saturday}</div>
                  <div>Sunday: {branch.hours.sunday}</div>
                </div>
              </div>

              {/* Services */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Services</h4>
                <div className="flex flex-wrap gap-1">
                  {branch.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => openInMaps(branch)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  <span className="text-sm">Directions</span>
                </button>
                <button
                  onClick={() => setSelectedBranch(branch)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">Details</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Branch Details Modal */}
      {selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedBranch.name}</h3>
                <button
                  onClick={() => setSelectedBranch(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Branch Manager</h4>
                  <p className="text-gray-600">{selectedBranch.manager}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Storage Capacity</h4>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: selectedBranch.capacity }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-600">{selectedBranch.capacity} utilized</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedBranch.availableStorage.toLocaleString()} sq ft available
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Full Address</h4>
                  <p className="text-gray-600">{selectedBranch.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Phone</h4>
                    <button
                      onClick={() => callBranch(selectedBranch.phone)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {selectedBranch.phone}
                    </button>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Email</h4>
                    <button
                      onClick={() => emailBranch(selectedBranch.email)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {selectedBranch.email}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => openInMaps(selectedBranch)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Get Directions
                  </button>
                  <button
                    onClick={() => callBranch(selectedBranch.phone)}
                    className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Call Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchesSection;
