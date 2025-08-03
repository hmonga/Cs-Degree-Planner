import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Heart, Coffee, Star, Gift, Zap } from 'lucide-react';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PaymentSupport = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(5);

  const donationOptions = [
    { amount: 5, icon: Coffee, label: 'Coffee', description: 'Buy us a coffee!' },
    { amount: 10, icon: Heart, label: 'Support', description: 'Support the project' },
    { amount: 25, icon: Star, label: 'Premium', description: 'Premium supporter' },
    { amount: 50, icon: Gift, label: 'Sponsor', description: 'Become a sponsor' },
    { amount: 100, icon: Zap, label: 'Hero', description: 'Project hero!' }
  ];

  const handleDonation = async (amount) => {
    setLoading(true);
    setMessage('');

    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Create checkout session
      const response = await fetch('http://localhost:3001/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          description: `Support Rutgers Degree Planner - $${amount} donation`
        }),
      });

      const session = await response.json();

      if (session.error) {
        throw new Error(session.error);
      }

      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAmount = () => {
    if (selectedAmount >= 1) {
      handleDonation(selectedAmount);
    } else {
      setMessage('Please enter a valid amount (minimum $1)');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rutgers-scarlet via-red-600 to-red-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <h1 className="text-5xl font-bold text-white mb-4 animate-typing">
            Support Rutgers Degree Planner
          </h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto leading-relaxed">
            Help us keep this tool free and continue improving it for all Rutgers students! 
            Your support helps cover server costs, AI processing, and development time.
          </p>
        </div>

        {/* Donation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {donationOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <div
                key={option.amount}
                className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-fadeInUp cursor-pointer group"
                onClick={() => handleDonation(option.amount)}
              >
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-rutgers-scarlet to-red-600 rounded-full mb-4 group-hover:animate-pulse">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    ${option.amount}
                  </h3>
                  <h4 className="text-lg font-semibold text-rutgers-scarlet mb-2">
                    {option.label}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {option.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Amount */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-auto animate-fadeInUp">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Custom Amount
          </h3>
          <div className="flex items-center space-x-4 mb-6">
            <span className="text-2xl font-bold text-rutgers-scarlet">$</span>
            <input
              type="number"
              min="1"
              step="0.01"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
              className="flex-1 text-2xl font-bold text-gray-800 border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-rutgers-scarlet focus:outline-none"
              placeholder="Enter amount"
            />
          </div>
          <button
            onClick={handleCustomAmount}
            disabled={loading || selectedAmount < 1}
            className="w-full bg-gradient-to-r from-rutgers-scarlet to-red-600 text-white font-bold py-4 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Processing...' : `Donate $${selectedAmount}`}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-6 text-center">
            <p className={`text-lg font-semibold ${message.includes('failed') ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </p>
          </div>
        )}

        {/* Why Support Section */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8 animate-fadeInUp">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Why Support Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Processing</h3>
              <p className="text-red-100">
                Your donations help cover the cost of AI transcript analysis and ChatGPT API usage.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Keep It Free</h3>
              <p className="text-red-100">
                Help us keep this tool completely free for all Rutgers students to use.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">New Features</h3>
              <p className="text-red-100">
                Support development of new features and improvements to help students succeed.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-red-100">
          <p className="text-sm">
            All donations are processed securely through Stripe. Thank you for your support! 💙
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSupport; 