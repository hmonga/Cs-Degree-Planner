import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { authService } from '../services/supabase';

const Auth = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSad, setIsSad] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setIsSad(false);

    try {
      if (isSignUp) {
        const { error } = await authService.signUp(email, password);
        if (error) {
          setError(error.message);
          setIsSad(true);
        } else {
          setMessage('Check your email for a confirmation link!');
        }
      } else {
        const { data, error } = await authService.signIn(email, password);
        if (error) {
          setError(error.message);
          setIsSad(true);
        } else {
          onAuthSuccess(data.user);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setIsSad(true);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setMessage('');
    setIsSad(false);
    setEmail('');
    setPassword('');
  };



  const renderSignInForm = () => (
    <>
      <div>
        <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-3">
          Email Address
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-rutgers-scarlet transition-colors" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rutgers-scarlet focus:border-rutgers-scarlet text-base transition-all duration-300 hover:border-gray-300"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-3">
          Password
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-rutgers-scarlet transition-colors" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rutgers-scarlet focus:border-rutgers-scarlet text-base transition-all duration-300 hover:border-gray-300"
            placeholder="Enter your password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-rutgers-scarlet transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>



      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-rutgers-scarlet to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rutgers-scarlet disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 hover:shadow-lg"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              {isSignUp ? (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rutgers-scarlet via-red-600 to-red-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Penguin Container */}
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 p-2">
              {/* Your Beautiful Penguin */}
              <img 
                src="/penguin.png" 
                alt="Cute Penguin" 
                className="w-full h-full object-contain"
                style={{ 
                  filter: isSad ? 'brightness(0.8) saturate(0.8)' : 'none',
                  transition: 'filter 0.3s ease-in-out'
                }}
              />
            </div>
          </div>
        </div>
        
        <h2 className="text-center text-4xl font-bold text-white mb-2 animate-fade-in-up">
          Rutgers CS Degree Planner
        </h2>
        <p className="text-center text-white/80 text-lg mb-8 animate-fade-in-up stagger-1">
          {isSignUp ? 'Create your account to start planning' : 'Welcome back! Sign in to continue'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm relative z-10">
        <div className="bg-white/95 backdrop-blur-sm py-10 px-8 shadow-2xl rounded-2xl border border-white/20 animate-fade-in-up stagger-2">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {renderSignInForm()}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4 animate-shake">
                <div className="text-sm text-red-700 font-medium">{error}</div>
              </div>
            )}

            {message && (
              <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                <div className="text-sm text-green-700 font-medium">{message}</div>
              </div>
            )}
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="w-full flex justify-center py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rutgers-scarlet transition-all duration-300 hover:scale-105"
              >
                {isSignUp ? 'Sign in instead' : 'Create new account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth; 