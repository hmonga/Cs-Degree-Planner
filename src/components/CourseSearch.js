import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, MapPin, BookOpen, Star, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import rutgersDataService from '../services/rutgersApis';

const CourseSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(rutgersDataService.getCurrentSemesterCode());
  const [error, setError] = useState(null);

  // Search courses when search term changes
  useEffect(() => {
    const searchCourses = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await rutgersDataService.searchCourses(searchTerm, selectedSemester);
        setSearchResults(results);
      } catch (err) {
        setError('Failed to search courses. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchCourses, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedSemester]);

  const [availabilityModal, setAvailabilityModal] = useState({ show: false, course: null, data: [] });

  const handleCourseAvailability = async (courseCode) => {
    try {
      const availability = await rutgersDataService.getCourseAvailability(courseCode, selectedSemester);
      setAvailabilityModal({
        show: true,
        course: courseCode,
        data: availability
      });
    } catch (err) {
      console.error('Error checking availability:', err);
      setAvailabilityModal({
        show: true,
        course: courseCode,
        data: []
      });
    }
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'CS': 'bg-blue-100 text-blue-800',
      'MATH': 'bg-green-100 text-green-800',
      'PHYS': 'bg-purple-100 text-purple-800'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800';
  };

  const getRateMyProfessorsUrl = (professorName, schoolName = 'Rutgers University-New Brunswick') => {
    if (!professorName) return null;
    
    // Clean professor name for URL
    const cleanName = professorName
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, '+') // Replace spaces with +
      .trim();
    
    return `https://www.ratemyprofessors.com/search/professors?query=${encodeURIComponent(cleanName)}&sid=${encodeURIComponent(schoolName)}`;
  };

  const isCSClass = (course) => {
    return course.code?.includes('198') || course.name?.toLowerCase().includes('computer science');
  };

  const getDataQualityIcon = (quality) => {
    if (!quality) return <Info className="w-3 h-3 text-gray-400" />;
    
    if (quality.isReliable) {
      return <CheckCircle className="w-3 h-3 text-green-500" />;
    } else {
      return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
    }
  };

  const getDataQualityColor = (quality) => {
    if (!quality) return 'text-gray-500';
    return quality.isReliable ? 'text-green-600' : 'text-yellow-600';
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Search className="w-5 h-5 mr-2" />
        Course Search & Availability
      </h3>

      {/* Data Accuracy Notice */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors duration-300 group">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0 group-hover:animate-bounce-gentle" />
          <div className="text-sm text-blue-800">
            <strong>Data Accuracy:</strong> Course information is sourced from Rutgers Official Schedule of Classes (SOC) API. 
            All data is validated and quality-checked. Please verify critical information (prerequisites, credits, availability) 
            with official Rutgers sources before registration.
          </div>
        </div>
      </div>

      {/* Fun search tips */}
      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-lg">💡</span>
          <div className="text-sm text-purple-800">
            <strong>Pro Tip:</strong> Try searching for "CS", "Computer Science", or specific course codes like "198:111" to find CS courses quickly! 
            <span className="ml-2 animate-pulse">🚀</span>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Courses
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by course code, name, or description..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rutgers-scarlet focus:border-transparent"
            />
          </div>
        </div>

        <div className="sm:w-48">
          <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
            Semester
          </label>
                      <select
              id="semester"
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rutgers-scarlet focus:border-transparent"
            >
              {rutgersDataService.getUpcomingSemesters(6).map(semester => (
                <option key={semester.code} value={semester.code}>
                  {semester.name}
                </option>
              ))}
            </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rutgers-scarlet"></div>
        </div>
      )}

      {/* Search Results */}
      {!loading && searchResults.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Found {searchResults.length} course{searchResults.length !== 1 ? 's' : ''}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searchResults.map((course, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 group relative overflow-hidden">
                {/* Fun hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Emoji decoration for CS classes */}
                {isCSClass(course) && (
                  <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity duration-300 text-2xl">
                    💻
                  </div>
                )}
                
                <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getSubjectColor(course.code.split(' ')[0])}`}>
                      {course.code.split(' ')[0]}
                    </span>
                    <h4 className="font-semibold text-gray-900">{course.code}</h4>
                  </div>
                  <span className="text-sm text-gray-500">{course.credits} credits</span>
                </div>
                
                <h5 className="font-medium text-gray-900 mb-2">{course.name}</h5>
                
                {course.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                )}

                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {course.semester}
                  </div>
                  {course.professor && (
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      <span>{course.professor}</span>
                      {isCSClass(course) && getRateMyProfessorsUrl(course.professor) && (
                        <a
                          href={getRateMyProfessorsUrl(course.professor)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="View professor ratings on RateMyProfessors.com"
                        >
                          <Star className="w-3 h-3" />
                          <span className="text-xs">Rate</span>
                        </a>
                      )}
                    </div>
                  )}
                  {course.campus && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {course.campus}
                    </div>
                  )}
                </div>

                {/* Data Quality Indicator */}
                {course.dataQuality && (
                  <div className="flex items-center space-x-2 mb-3 text-xs">
                    {getDataQualityIcon(course.dataQuality)}
                    <span className={`${getDataQualityColor(course.dataQuality)}`}>
                      {course.dataQuality.isReliable ? 'Reliable Data' : 'Limited Data Available'}
                    </span>
                    {course.dataQuality.issues && course.dataQuality.issues.length > 0 && (
                      <span className="text-gray-500">
                        ({course.dataQuality.issues.join(', ')})
                      </span>
                    )}
                  </div>
                )}

                {course.prerequisites && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
                    <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                      {course.prerequisites}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCourseAvailability(course.code)}
                    className="flex-1 btn-secondary text-xs py-2"
                  >
                    Check Availability
                  </button>
                  <a
                    href="https://sims.rutgers.edu/webreg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs py-2 px-3 flex items-center space-x-1"
                    title="Open Rutgers WebReg to register for this course"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>WebReg</span>
                  </a>
                  {course.synopsisUrl && (
                    <a
                      href={course.synopsisUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs py-2 px-3"
                      title="View course details"
                    >
                      <BookOpen className="w-3 h-3" />
                    </a>
                  )}
                </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && searchTerm.length >= 2 && searchResults.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No courses found matching "{searchTerm}"</p>
          <p className="text-sm text-gray-400 mt-1">Try a different search term or semester</p>
        </div>
      )}

      {/* Initial State */}
      {!loading && searchTerm.length < 2 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Search for courses to see availability</p>
          <p className="text-sm text-gray-400 mt-1">Enter at least 2 characters to start searching</p>
        </div>
      )}

      {/* Availability Modal */}
      {availabilityModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Course Availability: {availabilityModal.course}
              </h3>
              <button
                onClick={() => setAvailabilityModal({ show: false, course: null, data: [] })}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {availabilityModal.data.length > 0 ? (
              <div className="space-y-4">
                {availabilityModal.data.map((section, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{section.name}</h4>
                      <span className="text-sm text-gray-500">{section.credits} credits</span>
                    </div>
                    
                    {section.professor && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Professor:</strong> {section.professor}
                        {isCSClass(section) && getRateMyProfessorsUrl(section.professor) && (
                          <a
                            href={getRateMyProfessorsUrl(section.professor)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                            title="View professor ratings on RateMyProfessors.com"
                          >
                            <Star className="w-3 h-3" />
                            <span className="text-xs">Rate</span>
                          </a>
                        )}
                      </div>
                    )}
                    
                    {section.campus && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Campus:</strong> {section.campus}
                      </p>
                    )}
                    
                    {section.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Description:</strong> {section.description}
                      </p>
                    )}
                    
                    {section.prerequisites && (
                      <p className="text-sm text-gray-600">
                        <strong>Prerequisites:</strong> {section.prerequisites}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No availability data found for this course</p>
                <p className="text-sm text-gray-400 mt-1">This course may not be offered in the selected semester</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-between items-center">
              <a
                href="https://sims.rutgers.edu/webreg/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center space-x-2"
                title="Open Rutgers WebReg to register for courses"
              >
                <Calendar className="w-4 h-4" />
                <span>Open WebReg</span>
              </a>
              <button
                onClick={() => setAvailabilityModal({ show: false, course: null, data: [] })}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseSearch; 