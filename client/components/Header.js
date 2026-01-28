'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/loan.service';
import { LogOut, ChevronDown } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      authService.getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        });
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsDropdownOpen(false);
    router.push('/');
  };

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const avatarUrl = user 
    ? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.full_name || user.email)}`
    : null;

  return (
    <header className="bg-white border-b border-dark-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-shadow duration-300">
              <span className="text-dark-900 font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-dark-900">Mini-LOS</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <Link 
              href="/auth?redirect=/loan/apply" 
              className="text-dark-600 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Apply for Loan
            </Link>
            <Link 
              href="/admin" 
              className="text-dark-600 hover:text-primary-600 font-medium transition-colors duration-200"
            >
              Admin
            </Link>

            {/* User Avatar & Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-dark-100 transition-colors duration-200"
                >
                  <img
                    src={avatarUrl}
                    alt={user.full_name || 'User'}
                    className="w-9 h-9 rounded-full border-2 border-primary-400 shadow-sm"
                  />
                  <ChevronDown className={`w-4 h-4 text-dark-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-dark-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-dark-100">
                      <p className="font-semibold text-dark-900 truncate">{user.full_name}</p>
                      <p className="text-sm text-dark-500 truncate">{user.email}</p>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-rose-600 hover:bg-rose-50 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-dark-900 font-semibold rounded-lg hover:bg-primary-400 transition-colors duration-200 shadow-sm"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
