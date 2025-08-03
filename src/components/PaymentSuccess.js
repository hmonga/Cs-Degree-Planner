import React, { useEffect, useState } from 'react';
import { CheckCircle, Heart, ArrowLeft } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get('session_id');

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
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center animate-fadeInUp">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Thank You! 💙
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Your donation has been received successfully. Your support means the world to us and helps keep this tool free for all Rutgers students!
        </p>

        {sessionId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">
              Transaction ID: {sessionId}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center space-x-2 mb-8">
          <Heart className="w-6 h-6 text-red-500 animate-pulse" />
          <span className="text-lg font-semibold text-gray-700">
            You're amazing!
          </span>
          <Heart className="w-6 h-6 text-red-500 animate-pulse" />
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-rutgers-scarlet to-red-600 text-white font-bold py-4 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Return to App ({countdown}s)</span>
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess; 