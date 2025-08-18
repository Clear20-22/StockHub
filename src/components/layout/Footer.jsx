import React from 'react';
import { Package, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">StockHub</span>
            </div>
            <p className="text-gray-300 mb-4">
              Your trusted warehouse management solution. We provide secure, 
              efficient, and reliable storage services for businesses of all sizes.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm">contact@stockhub.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/branches" className="text-gray-300 hover:text-white transition-colors">
                  Our Branches
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-300 hover:text-white transition-colors">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-blue-400 mt-1" />
                <span className="text-gray-300 text-sm">
                  123 Warehouse District<br />
                  New York, NY 10001
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 StockHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
