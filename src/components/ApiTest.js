import React, { useState, useEffect } from 'react';
import { TestTube, CheckCircle, XCircle, Loader } from 'lucide-react';
import rutgersDataService from '../services/rutgersApis';

const ApiTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test 1: Get current semester
      results.currentSemester = {
        code: rutgersDataService.getCurrentSemesterCode(),
        name: rutgersDataService.getSemesterName(rutgersDataService.getCurrentSemesterCode())
      };

      // Test 2: Get CS courses for current semester
      try {
        const csCourses = await rutgersDataService.getOfficialSOCData('198', results.currentSemester.code);
        results.csCourses = {
          success: true,
          count: csCourses.length,
          sample: csCourses.slice(0, 3).map(c => c.code)
        };
      } catch (error) {
        results.csCourses = {
          success: false,
          error: error.message
        };
      }

      // Test 3: Get Math courses
      try {
        const mathCourses = await rutgersDataService.getOfficialSOCData('640', results.currentSemester.code);
        results.mathCourses = {
          success: true,
          count: mathCourses.length,
          sample: mathCourses.slice(0, 3).map(c => c.code)
        };
      } catch (error) {
        results.mathCourses = {
          success: false,
          error: error.message
        };
      }

      // Test 4: Search functionality
      try {
        const searchResults = await rutgersDataService.searchCourses('data structures');
        results.search = {
          success: true,
          count: searchResults.length,
          sample: searchResults.slice(0, 3).map(c => c.code)
        };
      } catch (error) {
        results.search = {
          success: false,
          error: error.message
        };
      }

      // Test 5: Upcoming semesters
      results.upcomingSemesters = rutgersDataService.getUpcomingSemesters(4);

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
        <TestTube className="w-5 h-5 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">API Connection Test</h3>
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
          <p className="text-gray-600">Testing API connections...</p>
        </div>
      )}

      {!loading && Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          {/* Current Semester */}
          {testResults.currentSemester && (
            <TestResult
              title="Current Semester Detection"
              success={true}
              details={`Detected: ${testResults.currentSemester.name} (${testResults.currentSemester.code})`}
            />
          )}

          {/* CS Courses */}
          {testResults.csCourses && (
            <TestResult
              title="CS Courses API"
              success={testResults.csCourses.success}
              error={testResults.csCourses.error}
              details={testResults.csCourses.success ? 
                `Found ${testResults.csCourses.count} CS courses. Sample: ${testResults.csCourses.sample.join(', ')}` : 
                null
              }
            />
          )}

          {/* Math Courses */}
          {testResults.mathCourses && (
            <TestResult
              title="Math Courses API"
              success={testResults.mathCourses.success}
              error={testResults.mathCourses.error}
              details={testResults.mathCourses.success ? 
                `Found ${testResults.mathCourses.count} Math courses. Sample: ${testResults.mathCourses.sample.join(', ')}` : 
                null
              }
            />
          )}

          {/* Search */}
          {testResults.search && (
            <TestResult
              title="Course Search"
              success={testResults.search.success}
              error={testResults.search.error}
              details={testResults.search.success ? 
                `Found ${testResults.search.count} courses matching "data structures". Sample: ${testResults.search.sample.join(', ')}` : 
                null
              }
            />
          )}

          {/* Upcoming Semesters */}
          {testResults.upcomingSemesters && (
            <TestResult
              title="Upcoming Semesters"
              success={true}
              details={`Next 4 semesters: ${testResults.upcomingSemesters.map(s => s.name).join(', ')}`}
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
        <h4 className="font-medium text-blue-900 mb-2">API Information</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Source:</strong> Official Rutgers SOC API</p>
          <p><strong>Endpoint:</strong> http://sis.rutgers.edu/oldsoc/courses.json</p>
          <p><strong>Data Format:</strong> JSON</p>
          <p><strong>Update Frequency:</strong> Real-time (as courses are added/removed)</p>
        </div>
      </div>
    </div>
  );
};

export default ApiTest; 