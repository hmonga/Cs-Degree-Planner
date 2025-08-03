import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase, authService } from '../services/supabase';

const SupabaseTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Supabase connection
      try {
        const { error } = await supabase.from('user_progress').select('count').limit(1);
        results.connection = {
          success: !error,
          error: error?.message
        };
      } catch (error) {
        results.connection = {
          success: false,
          error: error.message
        };
      }

      // Test 2: Authentication service
      try {
        const { data: { user } } = await authService.getCurrentUser();
        results.auth = {
          success: true,
          user: user ? 'User logged in' : 'No user logged in'
        };
      } catch (error) {
        results.auth = {
          success: false,
          error: error.message
        };
      }

      // Test 3: Environment variables
      results.env = {
        success: !!(process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY),
        url: process.env.REACT_APP_SUPABASE_URL ? 'Set' : 'Missing',
        key: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      };

    } catch (error) {
      results.generalError = error.message;
    }

    setTestResults(results);
    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const TestResult = ({ title, result, success, error, details }) => (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900">{title}</h4>
        {success ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
      </div>
      
      {success ? (
        <div className="text-sm text-gray-600">
          {details}
        </div>
      ) : (
        <div className="text-sm text-red-600">
          Error: {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="card">
      <div className="flex items-center mb-4">
        <Database className="w-5 h-5 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Supabase Connection Test</h3>
        <button
          onClick={runTests}
          disabled={loading}
          className="ml-auto btn-secondary text-sm"
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Re-run Tests'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-rutgers-scarlet" />
          <p className="text-gray-600">Testing Supabase connections...</p>
        </div>
      )}

      {!loading && Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          {/* Environment Variables */}
          {testResults.env && (
            <TestResult
              title="Environment Variables"
              success={testResults.env.success}
              error={testResults.env.error}
              details={`URL: ${testResults.env.url}, Key: ${testResults.env.key}`}
            />
          )}

          {/* Database Connection */}
          {testResults.connection && (
            <TestResult
              title="Database Connection"
              success={testResults.connection.success}
              error={testResults.connection.error}
              details="Successfully connected to Supabase database"
            />
          )}

          {/* Authentication Service */}
          {testResults.auth && (
            <TestResult
              title="Authentication Service"
              success={testResults.auth.success}
              error={testResults.auth.error}
              details={testResults.auth.user}
            />
          )}

          {/* General Error */}
          {testResults.generalError && (
            <TestResult
              title="General Error"
              success={false}
              error={testResults.generalError}
            />
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Supabase Information</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Project URL:</strong> {process.env.REACT_APP_SUPABASE_URL}</p>
          <p><strong>Status:</strong> {testResults.connection?.success ? 'Connected' : 'Not Connected'}</p>
          <p><strong>Authentication:</strong> {testResults.auth?.success ? 'Working' : 'Not Working'}</p>
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest; 