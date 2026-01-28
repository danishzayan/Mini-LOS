'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function OnboardingForm({ onSubmit, loading, user }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    dob: '',
    pan: '',
    mobile: '',
    email: user?.email || '',
    address: '',
    employment_type: 'SALARIED',
    monthly_income: '',
    loan_amount: '',
    loan_purpose: '',
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || prev.full_name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.dob);
      if (age < 21) {
        newErrors.dob = 'You must be at least 21 years old';
      }
    }

    if (!formData.pan.trim()) {
      newErrors.pan = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.toUpperCase())) {
      newErrors.pan = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Invalid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.monthly_income) {
      newErrors.monthly_income = 'Monthly income is required';
    } else if (parseFloat(formData.monthly_income) <= 0) {
      newErrors.monthly_income = 'Income must be greater than 0';
    }

    if (!formData.loan_amount) {
      newErrors.loan_amount = 'Loan amount is required';
    } else if (parseFloat(formData.loan_amount) <= 0) {
      newErrors.loan_amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.loan_amount) > parseFloat(formData.monthly_income) * 20) {
      newErrors.loan_amount = 'Loan amount cannot exceed 20x your monthly income';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Send data in the format expected by the backend API
      onSubmit({
        full_name: formData.full_name,
        mobile: formData.mobile,
        pan: formData.pan.toUpperCase(),
        dob: formData.dob,
        email: formData.email,
        address: formData.address || null,
        employment_type: formData.employment_type,
        monthly_income: parseFloat(formData.monthly_income),
        loan_amount: parseFloat(formData.loan_amount),
        loan_purpose: formData.loan_purpose || null,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Card */}
      <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-6 md:p-8 transition-all duration-300 hover:shadow-card-hover">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
            <svg className="w-5 h-5 text-dark-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-dark-900">Personal Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            error={errors.full_name}
            placeholder="Enter your full name"
            required
          />

          <Input
            label="Date of Birth"
            name="dob"
            type="date"
            value={formData.dob}
            onChange={handleChange}
            error={errors.dob}
            // Only allow dates where age >= 21
            max={(() => {
              const today = new Date();
              today.setFullYear(today.getFullYear() - 21);
              return today.toISOString().split('T')[0];
            })()}
            required
          />

          <Input
            label="PAN Number"
            name="pan"
            value={formData.pan}
            onChange={handleChange}
            error={errors.pan}
            placeholder="ABCDE1234F"
            maxLength={10}
            className="uppercase"
            required
          />

          <Input
            label="Phone Number"
            name="mobile"
            type="tel"
            value={formData.mobile}
            onChange={handleChange}
            error={errors.mobile}
            placeholder="9876543210"
            maxLength={10}
            required
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            required
            disabled={!!user?.email}
            className={user?.email ? 'bg-gray-100 cursor-not-allowed' : ''}
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="Enter your address (optional)"
          />
        </div>
      </div>

      {/* Employment & Loan Details Card */}
      <div className="bg-white rounded-2xl shadow-card border border-dark-100 p-6 md:p-8 transition-all duration-300 hover:shadow-card-hover">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
            <svg className="w-5 h-5 text-dark-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-dark-900">Employment & Loan Details</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employment Type <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            >
              <option value="SALARIED">Salaried</option>
              <option value="SELF_EMPLOYED">Self Employed</option>
            </select>
          </div>

          <Input
            label="Monthly Income (₹)"
            name="monthly_income"
            type="number"
            value={formData.monthly_income}
            onChange={handleChange}
            error={errors.monthly_income}
            placeholder="50000"
            min="0"
            required
          />

          <Input
            label="Loan Amount (₹)"
            name="loan_amount"
            type="number"
            value={formData.loan_amount}
            onChange={handleChange}
            error={errors.loan_amount}
            placeholder="500000"
            min="0"
            required
          />

          <Input
            label="Loan Purpose"
            name="loan_purpose"
            value={formData.loan_purpose}
            onChange={handleChange}
            error={errors.loan_purpose}
            placeholder="e.g., Home Renovation, Education (optional)"
          />
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-dark-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-dark-800">Maximum loan amount is 20x your monthly income.</p>
              {formData.monthly_income && (
                <p className="text-sm text-dark-600 mt-1">
                  Based on your income, you can apply up to <span className="font-bold text-primary-700">₹{(parseFloat(formData.monthly_income) * 20).toLocaleString()}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading} size="lg" className="px-8">
          Continue to KYC
        </Button>
      </div>
    </form>
  );
}
