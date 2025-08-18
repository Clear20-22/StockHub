import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About StockHub</h1>
        <div className="prose prose-lg">
          <p>
            StockHub is a comprehensive warehouse management system designed to help businesses 
            efficiently manage their inventory, track goods, and streamline their logistics operations.
          </p>
          <p>
            With state-of-the-art facilities and cutting-edge technology, we provide secure, 
            reliable, and cost-effective storage solutions for businesses of all sizes.
          </p>
          <h2>Our Mission</h2>
          <p>
            To revolutionize warehouse management through innovative technology and exceptional service, 
            helping businesses optimize their supply chain operations.
          </p>
          <h2>Our Values</h2>
          <ul>
            <li>Security and reliability</li>
            <li>Innovation and technology</li>
            <li>Customer satisfaction</li>
            <li>Transparency and trust</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;
