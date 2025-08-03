import React, { useEffect, useState } from 'react';
import { XCircle, ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentCancelled = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center animate-fadeInUp">
        <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          No worries! Your payment was cancelled. You can always come back and support us later. We appreciate you considering it! 💙
        </p>

        <div className="flex items-center justify-center space-x-2 mb-8">
          <Heart className="w-6 h-6 text-red-500" />
          <span className="text-lg font-semibold text-gray-700">
            Thanks for stopping by!
          </span>
          <Heart className="w-6 h-6 text-red-500" />
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-rutgers-scarlet to-red-600 text-white font-bold py-4 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Return to App ({countdown}s)</span>
          </button>
          
          <button
            onClick={() => navigate('/?tab=support')}
            className="w-full bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-300 transform hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled; 