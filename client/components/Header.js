'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/services/loan.service';
import { LogOut, ChevronDown, Shield, User, FileText, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Function to check and fetch user
  const checkUser = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await authService.getMe();
        setUser(userData);
      } catch {
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  // Listen for storage changes AND custom auth events
  useEffect(() => {
    const handleStorageChange = () => {
      checkUser();
    };
    
    // Listen for custom auth event (fired when login/logout happens)
    const handleAuthChange = () => {
      checkUser();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);
    
    // Also check on pathname change (navigation)
    checkUser();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [pathname]);

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
    // Force refresh to update all components
    router.refresh();
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
            <span className="text-xl font-bold text-dark-900">Mini-LOS</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-6">
            {/* Hide Admin link if user is admin (they can access via dropdown) */}
            {(!user || !user.is_admin) && (
              <Link 
                href="/admin" 
                className={`font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                  pathname === '/admin' 
                    ? 'text-primary-600' 
                    : 'text-dark-600 hover:text-primary-600'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* User Avatar & Dropdown */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-dark-100 transition-colors duration-200"
                >
                  <div className="relative">
                    <img
                      src={avatarUrl}
                      alt={user.full_name || 'User'}
                      className={`w-9 h-9 rounded-full border-2 shadow-sm ${
                        user.is_admin ? 'border-violet-500' : 'border-primary-400'
                      }`}
                    />
                    {user.is_admin && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center border-2 border-white">
                        <Shield className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-dark-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-card border border-dark-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-dark-100">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarUrl}
                          alt={user.full_name || 'User'}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-dark-900 truncate">{user.full_name}</p>
                          <p className="text-sm text-dark-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      {/* Role Badge */}
                      <div className="mt-3">
                        {user.is_admin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full">
                            <Shield className="w-3 h-3" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-dark-100 text-dark-600 text-xs font-semibold rounded-full">
                            <User className="w-3 h-3" />
                            Customer
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Menu Links */}
                    <div className="py-1 border-b border-dark-100">
                      {!user.is_admin && (
                        <Link
                          href="/my-applications"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-dark-700 hover:bg-dark-50 transition-colors duration-200"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                      )}
                      {user.is_admin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-violet-600 hover:bg-violet-50 transition-colors duration-200"
                        >
                          <Shield className="w-4 h-4" />
                          <span className="font-medium">Admin Dashboard</span>
                        </Link>
                      )}
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
