
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

const PageNavigator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentPath = window.location.pathname;
  const displayPath = `preview--result-analyzer-pro.lovable.app${currentPath}`;

  const pages = [
    { name: 'Index', path: '/' },
    { name: 'Login', path: '/login' },
    { name: 'Signup', path: '/signup' },
    { name: 'Dashboard', path: '/dashboard' }
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white p-2 flex justify-center items-center">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
        >
          <span>{displayPath}</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-60 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1">
              {pages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  className={`flex items-center px-4 py-2 text-sm ${
                    currentPath === page.path ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {currentPath === page.path && (
                    <span className="mr-2">✓</span>
                  )}
                  <div className="flex flex-col">
                    <span>{page.name}</span>
                    <span className="text-xs text-gray-400">{page.path}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageNavigator;
