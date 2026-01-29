'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Clock, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '@/utils/constants';

export default function Home() {
  const [stats, setStats] = useState({ total: 0 });

  useEffect(() => {
    // Fetch total applications count
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.BASE_URL}/loan/stats/total`);
        if (response.ok) {
          const data = await response.json();
          setStats({ total: data.total || 0 });
        }
      } catch (error) {
        console.log('Stats fetch failed, using default');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full viewport height minus header */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1731910051936-eebb9eb8390c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)'
          }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/40" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Get Your Loan <br />
              <span className="text-primary-400">Approved in Minutes</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
              Mini-LOS provides a streamlined loan application process with instant
              KYC verification and credit assessment. Apply now and get your eligibility result instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth?redirect=/loan/apply"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-400 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25"
              >
                Apply Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Track Application
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center gap-8">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">{stats.total > 0 ? stats.total : '20'}+</span>
                <span className="text-sm text-gray-400">Applications</span>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">95%</span>
                <span className="text-sm text-gray-400">Approval Rate</span>
              </div>
              <div className="w-px h-10 bg-gray-700" />
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">5 Min</span>
                <span className="text-sm text-gray-400">Quick Process</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Mini-LOS?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Quick Process
              </h3>
              <p className="text-gray-600">
                Complete your loan application in just a few minutes with our
                streamlined 4-step process.
              </p>
            </div>

            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Secure Verification
              </h3>
              <p className="text-gray-600">
                Your data is protected with bank-grade security during KYC
                and credit verification.
              </p>
            </div>

            <div className="card text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Instant Decision
              </h3>
              <p className="text-gray-600">
                Get your loan eligibility decision instantly after completing
                all verification steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Personal Info', desc: 'Fill in your basic details and loan requirements' },
              { step: 2, title: 'KYC Verification', desc: 'Verify your identity with PAN and documents' },
              { step: 3, title: 'Credit Check', desc: 'We assess your credit history and score' },
              { step: 4, title: 'Get Result', desc: 'Receive instant eligibility decision' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500 text-gray-900 rounded-full font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/auth?redirect=/loan/apply"
              className="inline-flex items-center gap-2 bg-primary-500 text-gray-900 font-semibold text-lg px-8 py-3 rounded-lg hover:bg-primary-400 transition-colors"
            >
              Start Application
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Eligibility Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Eligibility Criteria
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Basic Requirements</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Minimum age: 21 years
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Valid PAN card
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Indian mobile number
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Credit Requirements</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Credit score: 650+
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Max active loans: 5
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Loan limit: 20x monthly income
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
