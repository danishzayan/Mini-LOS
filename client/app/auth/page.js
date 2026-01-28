'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/loan.service';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { LogIn, UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/my-applications';
  
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  
  const [registerForm, setRegisterForm] = useState({
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token is valid
      authService.getMe()
        .then(() => {
          router.push(redirectTo);
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, [router, redirectTo]);

  const validateLoginForm = () => {
    const newErrors = {};
    
    if (!loginForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!loginForm.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors = {};
    
    if (!registerForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!registerForm.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (registerForm.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }
    
    if (!registerForm.password) {
      newErrors.password = 'Password is required';
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateLoginForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await authService.login(loginForm.email, loginForm.password);
      // Only redirect if token is set (login success)
      const token = localStorage.getItem('token');
      if (token) {
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await authService.register({
        email: registerForm.email,
        full_name: registerForm.full_name,
        password: registerForm.password,
      });
      
      setSuccess('Registration successful! Please login.');
      setIsLogin(true);
      setLoginForm({ email: registerForm.email, password: '' });
      setRegisterForm({ email: '', full_name: '', password: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setErrors({});
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-300 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">

        <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl mb-4 shadow-glow">
              {isLogin ? (
                <LogIn className="h-8 w-8 text-dark-900" />
              ) : (
                <UserPlus className="h-8 w-8 text-dark-900" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-dark-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-dark-500 mt-2">
              {isLogin 
                ? 'Sign in to continue your loan application' 
                : 'Register to start your loan application'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <p className="text-emerald-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <p className="text-rose-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-4 top-[38px] h-5 w-5 text-dark-400 pointer-events-none" />
                <Input
                  label="Email Address"
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  error={errors.email}
                  placeholder="you@example.com"
                  className="pl-12"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-[38px] h-5 w-5 text-dark-400 pointer-events-none" />
                <Input
                  label="Password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  error={errors.password}
                  placeholder="••••••••"
                  className="pl-12"
                  required
                />
              </div>

              <Button type="submit" loading={loading} className="w-full" size="lg">
                <LogIn className="h-5 w-5 mr-2" />
                Sign In
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-[38px] h-5 w-5 text-dark-400 pointer-events-none" />
                <Input
                  label="Full Name"
                  type="text"
                  value={registerForm.full_name}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, full_name: e.target.value });
                    if (errors.full_name) setErrors({ ...errors, full_name: '' });
                  }}
                  error={errors.full_name}
                  placeholder="John Doe"
                  className="pl-12"
                  required
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-[38px] h-5 w-5 text-dark-400 pointer-events-none" />
                <Input
                  label="Email Address"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  error={errors.email}
                  placeholder="you@example.com"
                  className="pl-12"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-[38px] h-5 w-5 text-dark-400 pointer-events-none" />
                <Input
                  label="Password"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  error={errors.password}
                  placeholder="••••••••"
                  className="pl-12"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-[38px] h-5 w-5 text-dark-400 pointer-events-none" />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  error={errors.confirmPassword}
                  placeholder="••••••••"
                  className="pl-12"
                  required
                />
              </div>

              <Button type="submit" loading={loading} className="w-full" size="lg">
                <UserPlus className="h-5 w-5 mr-2" />
                Create Account
              </Button>
            </form>
          )}

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-dark-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={switchMode}
                className="ml-2 font-semibold text-primary-600 hover:text-primary-700 transition-colors"
              >
                {isLogin ? 'Register' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Info text */}
        <p className="text-center text-dark-400 text-sm mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
