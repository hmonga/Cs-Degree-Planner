import React, { useState } from 'react';
import { Search, BookOpen, Users, Calendar, Star, AlertTriangle, Info, X } from 'lucide-react';
import rutgersDataService from '../services/rutgersApis';

const CoreCourseExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchType, setSearchType] = useState('code'); // 'code' or 'keyword'

  const searchCourse = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      let results = [];
      
      if (searchType === 'code') {
        // Search by course code
        results = await rutgersDataService.searchCourseByCode(searchTerm.trim());
      } else {
        // Search by keyword
        results = await rutgersDataService.searchCoursesByKeyword(searchTerm.trim());
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for course:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearched(false);
  };

  const getRateMyProfessorsUrl = (professorName, schoolName = 'Rutgers University-New Brunswick') => {
    if (!professorName) return null;
    const formattedName = professorName.replace(/\s+/g, '+');
    return `https://www.ratemyprofessors.com/search/professors/1255?q=${formattedName}`;
  };

  const isCSClass = (course) => {
    return course.code && course.code.includes('198:');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <BookOpen className="w-6 h-6 mr-3 text-rutgers-scarlet" />
          Core Course Explorer
        </h1>
        <p className="text-gray-600 mb-4">
          Search for Rutgers courses by course code or keywords to get detailed information.
        </p>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <strong>How to use:</strong> 
          <ul className="mt-1 space-y-1">
            <li>• <strong>Course Code:</strong> Enter "01:198:111", "198:111", "198", or "01:198"</li>
            <li>• <strong>Keywords:</strong> Search by course title like "calculus", "writing", "psychology"</li>
          </ul>
        </div>
      </div>

      {/* Search Interface */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={searchType === 'code' ? "Enter course code (e.g., 01:198:111, 198, 01:198)..." : "Enter keywords (e.g., calculus, writing, psychology)..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCourse()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rutgers-scarlet focus:border-transparent text-lg"
            />
          </div>
          <button
            onClick={searchCourse}
            disabled={loading || !searchTerm.trim()}
            className="px-6 py-3 bg-rutgers-scarlet text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          {searched && (
            <button
              onClick={clearSearch}
              className="px-4 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Type Toggle */}
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="radio"
              name="searchType"
              value="code"
              checked={searchType === 'code'}
              onChange={(e) => setSearchType(e.target.value)}
              className="text-rutgers-scarlet focus:ring-rutgers-scarlet"
            />
            <span>Course Code</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="radio"
              name="searchType"
              value="keyword"
              checked={searchType === 'keyword'}
              onChange={(e) => setSearchType(e.target.value)}
              className="text-rutgers-scarlet focus:ring-rutgers-scarlet"
            />
            <span>Keywords</span>
          </label>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rutgers-scarlet mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for courses...</p>
        </div>
      )}

      {/* No Results */}
      {!loading && searched && searchResults.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">
            No courses found matching "{searchTerm}". Please check your search terms and try again.
          </p>
        </div>
      )}

      {/* Search Results */}
      {!loading && searchResults.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {searchResults.length} course{searchResults.length !== 1 ? 's' : ''} found
            </h2>
          </div>
          
          {searchResults.map((course, index) => (
            <div key={`${course.code}-${index}`} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-xl mb-2">{course.code}</h3>
                  <p className="text-lg text-gray-700 mb-2">{course.name}</p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {isCSClass(course) && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      CS Class
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {course.credits} credits
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {course.semester && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{course.semester}</span>
                  </div>
                )}
                
                {course.professor && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{course.professor}</span>
                    {getRateMyProfessorsUrl(course.professor) && (
                      <a
                        href={getRateMyProfessorsUrl(course.professor)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="View professor ratings on RateMyProfessors.com"
                      >
                        <Star className="w-3 h-3" />
                        <span className="text-xs">Rate</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {course.description && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Description:</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{course.description}</p>
                </div>
              )}

              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Prerequisites:</h4>
                  <p className="text-gray-600 text-sm">{course.prerequisites.join(', ')}</p>
                </div>
              )}

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Info className="w-4 h-4" />
                <span>Data from Rutgers Official Schedule of Classes (SOC) API</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoreCourseExplorer; 