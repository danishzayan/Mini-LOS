'use client';

import { useState } from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

export default function OnboardingForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    pan_number: '',
    phone: '',
    email: '',
    monthly_income: '',
    requested_amount: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else {
      const age = calculateAge(formData.date_of_birth);
      if (age < 21) {
        newErrors.date_of_birth = 'You must be at least 21 years old';
      }
    }

    if (!formData.pan_number.trim()) {
      newErrors.pan_number = 'PAN number is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan_number.toUpperCase())) {
      newErrors.pan_number = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
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

    if (!formData.requested_amount) {
      newErrors.requested_amount = 'Loan amount is required';
    } else if (parseFloat(formData.requested_amount) <= 0) {
      newErrors.requested_amount = 'Amount must be greater than 0';
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
      onSubmit({
        ...formData,
        pan_number: formData.pan_number.toUpperCase(),
        monthly_income: parseFloat(formData.monthly_income),
        requested_amount: parseFloat(formData.requested_amount),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
        
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
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleChange}
            error={errors.date_of_birth}
            max={new Date().toISOString().split('T')[0]}
            required
          />

          <Input
            label="PAN Number"
            name="pan_number"
            value={formData.pan_number}
            onChange={handleChange}
            error={errors.pan_number}
            placeholder="ABCDE1234F"
            maxLength={10}
            className="uppercase"
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
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
          />
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            label="Requested Loan Amount (₹)"
            name="requested_amount"
            type="number"
            value={formData.requested_amount}
            onChange={handleChange}
            error={errors.requested_amount}
            placeholder="500000"
            min="0"
            required
          />
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Maximum loan amount is 20x your monthly income.
            {formData.monthly_income && (
              <span className="block mt-1">
                Based on your income, you can apply up to ₹{(parseFloat(formData.monthly_income) * 20).toLocaleString()}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={loading} size="lg">
          Continue to KYC
        </Button>
      </div>
    </form>
  );
}
