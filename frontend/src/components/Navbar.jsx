import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6">
      <div className="font-bold text-xl text-blue-600">
        <Link to="/">Chat Platform</Link>
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold cursor-pointer">
          U
        </div>
      </div>
    </header>
  );
};

export default Navbar;
