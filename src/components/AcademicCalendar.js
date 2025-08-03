import React, { useState, useEffect } from 'react';
import { Calendar, Printer } from 'lucide-react';
import { ACADEMIC_CALENDAR } from '../data/academicCalendar';

const AcademicCalendar = () => {
  const [events, setEvents] = useState([]);

  // Get academic years from the calendar data
  const academicYears = Object.keys(ACADEMIC_CALENDAR).sort();

  useEffect(() => {
    const academicYears = Object.keys(ACADEMIC_CALENDAR);
    let allEvents = [];
    const allEventNames = new Set();

    // Collect all unique event names across all years
    academicYears.forEach(year => {
      const yearData = ACADEMIC_CALENDAR[year];
      if (!yearData) return;

      // Check each semester (fall, spring, winter, etc.)
      Object.values(yearData).forEach(semesterData => {
        if (semesterData.events) {
          // Handle events array
          semesterData.events.forEach(event => {
            allEventNames.add(event.name);
          });
        } else if (semesterData.name) {
          // Handle single semester events (like winter session)
          allEventNames.add(semesterData.name);
        }
      });
    });

    // Create events array with data for each year
    Array.from(allEventNames).forEach(eventName => {
      const eventData = {
        name: eventName,
        years: {}
      };

      academicYears.forEach(year => {
        if (ACADEMIC_CALENDAR[year]) {
          // Search through all semesters in this year
          let foundEvents = [];
          
          Object.values(ACADEMIC_CALENDAR[year]).forEach(semesterData => {
            if (semesterData.events) {
              // Look for all events with this name in events array
              const matchingEvents = semesterData.events.filter(e => e.name === eventName);
              foundEvents.push(...matchingEvents);
            } else if (semesterData.name === eventName) {
              // Direct semester event
              foundEvents.push(semesterData);
            }
          });
          
          // If multiple events with same name, combine them
          if (foundEvents.length > 1) {
            eventData.years[year] = foundEvents;
          } else if (foundEvents.length === 1) {
            eventData.years[year] = foundEvents[0];
          } else {
            eventData.years[year] = null;
          }
        } else {
          eventData.years[year] = null;
        }
      });

      allEvents.push(eventData);
    });

    setEvents(allEvents);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Parse the date string properly to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
    // Parse dates properly to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  };

  const getEventDisplayValue = (eventData) => {
    if (!eventData) return '';
    
    // Handle array of events (multiple events with same name)
    if (Array.isArray(eventData)) {
      return eventData.map(event => {
        if (event.date) {
          const dateStr = formatDate(event.date);
          return event.description ? `${dateStr} (${event.description})` : dateStr;
        } else if (event.startDate && event.endDate) {
          return formatDateRange(event.startDate, event.endDate);
        }
        return '';
      }).join(' ');
    }
    
    // Handle single event
    if (eventData.date) {
      const dateStr = formatDate(eventData.date);
      return eventData.description ? `${dateStr} (${eventData.description})` : dateStr;
    } else if (eventData.startDate && eventData.endDate) {
      return formatDateRange(eventData.startDate, eventData.endDate);
    }
    
    return '';
  };

  const getEventRowClass = (eventName) => {
    const name = eventName.toLowerCase();
    if (name.includes('reading')) return 'bg-gray-50';
    if (name.includes('exam')) return 'border-b-2 border-red-500';
    if (name.includes('winter session')) return 'border-b-2 border-red-500';
    return '';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-rutgers-scarlet" />
          Academic Calendar
        </h1>
        <p className="text-gray-600">
          Rutgers University academic calendar with key dates and events
        </p>
      </div>

      {/* Print Button */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex justify-end">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Calendar Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                  Event
                </th>
                {academicYears.map(year => (
                  <th key={year} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event, index) => (
                <tr key={index} className={getEventRowClass(event.name)}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {event.name}
                  </td>
                  {academicYears.map(year => (
                    <td key={year} className="px-6 py-4 text-sm text-gray-600">
                      {event.years[year] ? getEventDisplayValue(event.years[year]) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>



      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #000 !important;
            padding: 8px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AcademicCalendar; 