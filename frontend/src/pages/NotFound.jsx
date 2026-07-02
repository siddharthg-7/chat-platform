import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex-col">
      <h1 className="text-9xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-xl text-gray-600">Oops! Page not found.</p>
      <div className="mt-6">
        <Link to="/" className="text-blue-600 hover:text-blue-500 font-medium">
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
