// Rutgers University Data Sources Service
// Multiple APIs and endpoints for current course information

import corsProxy from './corsProxy';

class RutgersDataService {
  // Official Rutgers SOC API (more recent than the PoC)
  async getOfficialSOCData(subject, semester, campus = 'NB', level = 'UG') {
    try {
      const params = new URLSearchParams({
        subject,
        semester,
        campus,
        level
      });
      
      const url = `http://sis.rutgers.edu/oldsoc/courses.json?${params}`;
      const data = await corsProxy.fetchWithProxy(url);
      return this.transformSOCData(data);
    } catch (error) {
      console.error('Error fetching official SOC data:', error);
      throw error;
    }
  }

  // Transform official SOC data to consistent format
  transformSOCData(apiData) {
    if (!apiData || !Array.isArray(apiData)) {
      return [];
    }

    return apiData.map(course => {
      // Validate and clean course data
      const validatedCourse = {
        code: this.validateCourseCode(course.subject, course.number),
        name: this.validateCourseName(course.title || course.expandedTitle),
        credits: this.validateCredits(course.credits),
        description: this.validateDescription(course.description),
        prerequisites: this.validatePrerequisites(course.preReqNotes),
        semester: this.getSemesterName(course.semester),
        professor: this.validateProfessor(course.professor),
        campus: this.validateCampus(course.campus),
        synopsisUrl: this.validateUrl(course.synopsisUrl),
        notes: this.validateNotes(course.notes),
        sections: this.validateSections(course.sections || []),
        source: 'Official SOC API',
        lastUpdated: new Date().toISOString(),
        dataQuality: this.assessDataQuality(course)
      };

      return validatedCourse;
    });
  }

  // Data validation methods
  validateCourseCode(subject, number) {
    if (!subject || !number) return 'Unknown Course';
    return `${subject} ${number}`.trim();
  }

  validateCourseName(name) {
    if (!name || typeof name !== 'string') return 'Course Title Not Available';
    return name.trim();
  }

  validateCredits(credits) {
    if (!credits || isNaN(credits) || credits <= 0) return 0;
    return Math.round(credits * 100) / 100; // Round to 2 decimal places
  }

  validateDescription(description) {
    if (!description || typeof description !== 'string') return 'Course description not available.';
    return description.trim();
  }

  validatePrerequisites(prereqs) {
    if (!prereqs || typeof prereqs !== 'string') return '';
    return prereqs.trim();
  }

  validateProfessor(professor) {
    if (!professor || typeof professor !== 'string') return null;
    const cleanProfessor = professor.trim();
    // Remove common placeholder text
    if (cleanProfessor.toLowerCase().includes('staff') || 
        cleanProfessor.toLowerCase().includes('tba') ||
        cleanProfessor.toLowerCase().includes('to be announced')) {
      return null;
    }
    return cleanProfessor;
  }

  validateCampus(campus) {
    if (!campus || typeof campus !== 'string') return 'New Brunswick';
    const validCampuses = ['New Brunswick', 'Newark', 'Camden', 'NB', 'NK', 'CM'];
    return validCampuses.includes(campus) ? campus : 'New Brunswick';
  }

  validateUrl(url) {
    if (!url || typeof url !== 'string') return null;
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  }

  validateNotes(notes) {
    if (!notes || typeof notes !== 'string') return '';
    return notes.trim();
  }

  validateSections(sections) {
    if (!Array.isArray(sections)) return [];
    return sections.filter(section => section && typeof section === 'object');
  }

  assessDataQuality(course) {
    let quality = 100;
    let issues = [];

    if (!course.title && !course.expandedTitle) {
      quality -= 30;
      issues.push('Missing course title');
    }
    if (!course.credits || course.credits <= 0) {
      quality -= 20;
      issues.push('Invalid credit count');
    }
    if (!course.description) {
      quality -= 15;
      issues.push('Missing description');
    }
    if (!course.professor || course.professor.toLowerCase().includes('staff')) {
      quality -= 10;
      issues.push('Professor not assigned');
    }

    return {
      score: Math.max(0, quality),
      issues: issues,
      isReliable: quality >= 70
    };
  }

  // Get current semester code
  getCurrentSemesterCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    // Spring semester (1) or Fall semester (9)
    const semester = month >= 1 && month <= 5 ? '1' : '9';
    return `${semester}${year}`;
  }

  // Check if data is current (within last 24 hours)
  isDataCurrent(lastUpdated) {
    if (!lastUpdated) return false;
    const lastUpdate = new Date(lastUpdated);
    const now = new Date();
    const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
    return hoursDiff < 24;
  }

  // Get data freshness status
  getDataFreshnessStatus(lastUpdated) {
    if (!lastUpdated) return { status: 'unknown', message: 'Data freshness unknown' };
    
    const lastUpdate = new Date(lastUpdated);
    const now = new Date();
    const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
    const daysDiff = hoursDiff / 24;

    if (hoursDiff < 1) {
      return { status: 'very-recent', message: 'Updated within the last hour' };
    } else if (hoursDiff < 24) {
      return { status: 'recent', message: `Updated ${Math.round(hoursDiff)} hours ago` };
    } else if (daysDiff < 7) {
      return { status: 'moderate', message: `Updated ${Math.round(daysDiff)} days ago` };
    } else {
      return { status: 'stale', message: `Data may be outdated (${Math.round(daysDiff)} days old)` };
    }
  }

  // Get next semester code
  getNextSemesterCode() {
    const current = this.getCurrentSemesterCode();
    const semester = current.charAt(0);
    const year = parseInt(current.substring(1));
    
    if (semester === '1') {
      // Spring -> Fall
      return `9${year}`;
    } else {
      // Fall -> Spring
      return `1${year + 1}`;
    }
  }

  // Convert semester code to readable name
  getSemesterName(semesterCode) {
    const semesterMap = {
      '12018': 'Spring 2018', '12019': 'Spring 2019', '12020': 'Spring 2020',
      '12021': 'Spring 2021', '12022': 'Spring 2022', '12023': 'Spring 2023',
      '12024': 'Spring 2024', '12025': 'Spring 2025', '12026': 'Spring 2026',
      '92018': 'Fall 2018', '92019': 'Fall 2019', '92020': 'Fall 2020',
      '92021': 'Fall 2021', '92022': 'Fall 2022', '92023': 'Fall 2023',
      '92024': 'Fall 2024', '92025': 'Fall 2025', '92026': 'Fall 2026'
    };
    return semesterMap[semesterCode] || semesterCode;
  }

  // Subject code mappings
  getSubjectCodes() {
    return {
      'CS': '198',
      'MATH': '640', 
      'PHYS': '750',
      'CHEM': '160',
      'BIO': '119',
      'ENG': '350',
      'HIST': '510',
      'PSYCH': '830',
      'ECON': '220',
      'PHIL': '730',
      'ART': '070',
      'MUS': '700',
      'THTR': '965'
    };
  }

  // Get courses for multiple subjects
  async getCoursesForSubjects(subjects, semester = null) {
    const currentSemester = semester || this.getCurrentSemesterCode();
    const subjectCodes = this.getSubjectCodes();
    
    const promises = subjects.map(subject => {
      const code = subjectCodes[subject];
      if (!code) {
        console.warn(`Unknown subject: ${subject}`);
        return Promise.resolve([]);
      }
      return this.getOfficialSOCData(code, currentSemester);
    });

    try {
      const results = await Promise.all(promises);
      return results.flat();
    } catch (error) {
      console.error('Error fetching courses for subjects:', error);
      throw error;
    }
  }

  // Search courses across multiple subjects
  async searchCourses(keyword, semester = null) {
    try {
      const currentSemester = semester || this.getCurrentSemesterCode();
      
      // Get courses from major subjects
      const subjects = ['CS', 'MATH', 'PHYS', 'CHEM', 'BIO', 'ENG', 'HIST', 'PSYCH'];
      const allCourses = await this.getCoursesForSubjects(subjects, currentSemester);
      
      // Filter by keyword
      return allCourses.filter(course => 
        course.name?.toLowerCase().includes(keyword.toLowerCase()) ||
        course.code?.toLowerCase().includes(keyword.toLowerCase()) ||
        course.description?.toLowerCase().includes(keyword.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching courses:', error);
      throw error;
    }
  }

  // Get course availability for specific course
  async getCourseAvailability(courseCode, semester = null) {
    try {
      const currentSemester = semester || this.getCurrentSemesterCode();
      const [subject] = courseCode.split(' ');
      
      const subjectCodes = this.getSubjectCodes();
      const subjectCode = subjectCodes[subject];
      
      if (!subjectCode) {
        throw new Error(`Unknown subject: ${subject}`);
      }

      const courses = await this.getOfficialSOCData(subjectCode, currentSemester);
      return courses.filter(course => course.code === courseCode);
    } catch (error) {
      console.error('Error getting course availability:', error);
      throw error;
    }
  }

  // Get upcoming semesters
  getUpcomingSemesters(count = 4) {
    const semesters = [];
    let current = this.getCurrentSemesterCode();
    
    for (let i = 0; i < count; i++) {
      semesters.push({
        code: current,
        name: this.getSemesterName(current)
      });
      current = this.getNextSemesterCode();
    }
    
    return semesters;
  }

  // Check if a semester is current/upcoming
  isCurrentOrUpcoming(semesterCode) {
    const current = this.getCurrentSemesterCode();
    const next = this.getNextSemesterCode();
    return semesterCode === current || semesterCode === next;
  }

  // Get comprehensive list of core subjects for SAS requirements
  async getAllCoreSubjects() {
    // SAS Core Curriculum subjects for CS students
    const coreSubjects = [
      // Computer Science & Math (already in major requirements)
      { code: '198', name: 'Computer Science' },
      { code: '640', name: 'Mathematics' },
      { code: '750', name: 'Physics' },
      
      // Natural Sciences [NS] - 6 credits (excluding Physics/Chemistry which are in major requirements)
      { code: '119', name: 'Biology' },
      
      // Writing & Communication [WC] - 9 credits
      { code: '355', name: 'Writing' },
      
      // Arts & Humanities [AH] - 6 credits
      { code: '730', name: 'Philosophy' },
      { code: '350', name: 'English' },
      { code: '420', name: 'Spanish' },
      { code: '082', name: 'Art History' },
      { code: '700', name: 'Music' },
      { code: '965', name: 'Theater Arts' },
      { code: '351', name: 'Creative Writing' },
      
      // Social & Historical Analysis [SCL/HST] - 6 credits
      { code: '070', name: 'Anthropology' },
      { code: '220', name: 'Economics' },
      { code: '510', name: 'History' },
      { code: '830', name: 'Psychology' },
      { code: '790', name: 'Political Science' },
      { code: '920', name: 'Sociology' },
      
      // Contemporary Challenges [CC] - 7 credits
      { code: '013', name: 'African American Studies' },
      { code: '050', name: 'American Studies' },
      { code: '014', name: 'Asian Studies' },
      { code: '016', name: 'Latino Studies' },
      { code: '940', name: 'Women\'s Studies' },
      
      // Quantitative & Formal Reasoning [QQ/QR] - 6 credits
      { code: '960', name: 'Statistics' }
    ];

    const allCourses = [];
    const currentSemester = this.getCurrentSemesterCode();

    for (const subject of coreSubjects) {
      try {
        const courses = await this.getOfficialSOCData(subject.code, currentSemester);
        allCourses.push(...courses.map(course => ({
          ...course,
          subject: subject.name,
          subjectCode: subject.code
        })));
      } catch (error) {
        console.warn(`Failed to fetch courses for subject ${subject.code}:`, error);
      }
    }

    return allCourses;
  }

  // Get courses by SAS Core category
  async getCoursesByCoreCategory(category) {
    const categoryMappings = {
      contemporaryChallenges: {
        subjects: ['013', '050', '014', '016', '940'],
        keywords: ['contemporary', 'challenge', 'diversity', 'social', 'inequality', 'global', 'technology', 'society']
      },
      naturalSciences: {
        subjects: ['119'],
        keywords: ['biology', 'environmental', 'natural science', 'laboratory']
      },
      socialHistorical: {
        subjects: ['510', '830', '790', '920', '070'],
        keywords: ['history', 'sociology', 'anthropology', 'political', 'psychology', 'social analysis', 'historical analysis']
      },
      artsHumanities: {
        subjects: ['730', '350', '420', '700', '965', '351', '082'],
        keywords: ['philosophy', 'literature', 'language', 'art', 'music', 'theater', 'creative', 'humanities', 'arts']
      },
      writingCommunication: {
        subjects: ['355'],
        keywords: ['writing', 'composition', 'communication', 'college writing', 'academic writing']
      },
      quantitativeReasoning: {
        subjects: ['960'],
        keywords: ['statistics', 'quantitative', 'data analysis', 'mathematical reasoning']
      }
    };

    const mapping = categoryMappings[category];
    if (!mapping) return [];

    try {
      const allCourses = [];
      const currentSemester = this.getCurrentSemesterCode();
      
      for (const subject of mapping.subjects) {
        try {
          const courses = await this.getOfficialSOCData(subject, currentSemester);
          allCourses.push(...courses);
        } catch (error) {
          console.warn(`Failed to fetch courses for subject ${subject}:`, error);
        }
      }

      return allCourses;
    } catch (error) {
      console.error('Error fetching courses by core category:', error);
      return [];
    }
  }

  async searchCourseByCode(courseCode) {
    if (!courseCode || typeof courseCode !== 'string') {
      return [];
    }

    try {
      // Clean the course code (remove spaces, normalize format)
      const cleanCode = courseCode.trim().replace(/\s+/g, '');
      
      // Handle different search patterns
      let searchPattern = '';
      let searchType = 'exact';
      
      // Check if it's a partial search (e.g., "01", "01:198", "198")
      if (cleanCode.includes(':')) {
        const parts = cleanCode.split(':');
        if (parts.length >= 3) {
          // Full code: "01:198:111"
          searchPattern = `${parts[1]}:${parts[2]}`;
          searchType = 'exact';
        } else if (parts.length === 2) {
          // Partial code: "01:198" or "198:111"
          if (parts[0] === '01') {
            // "01:198" - search by subject
            searchPattern = parts[1];
            searchType = 'subject';
          } else {
            // "198:111" - search by subject and number
            searchPattern = `${parts[0]}:${parts[1]}`;
            searchType = 'exact';
          }
        }
      } else if (cleanCode.length <= 3) {
        // Just subject code: "198" or "01"
        searchPattern = cleanCode;
        searchType = 'subject';
      } else if (cleanCode.includes(' ')) {
        // Space-separated: "198 111"
        const parts = cleanCode.split(' ');
        searchPattern = `${parts[0]}:${parts[1]}`;
        searchType = 'exact';
      } else {
        // Continuous string: "198111"
        if (cleanCode.length >= 6) {
          const subject = cleanCode.substring(0, 3);
          const number = cleanCode.substring(3);
          searchPattern = `${subject}:${number}`;
          searchType = 'exact';
        } else {
          // Assume it's a subject code
          searchPattern = cleanCode;
          searchType = 'subject';
        }
      }

      if (!searchPattern) {
        return [];
      }

      let allCourses = [];
      
      if (searchType === 'subject') {
        // Search by subject code - get all courses in that subject
        const currentSemester = this.getCurrentSemesterCode();
        try {
          allCourses = await this.getOfficialSOCData(searchPattern, currentSemester);
        } catch (error) {
          console.warn(`Failed to fetch courses for subject ${searchPattern}:`, error);
        }
      } else {
        // Search by exact pattern
        const parts = searchPattern.split(':');
        if (parts.length === 2) {
          const subject = parts[0];
          const number = parts[1];
          const currentSemester = this.getCurrentSemesterCode();
          
          try {
            const courses = await this.getOfficialSOCData(subject, currentSemester);
            allCourses = courses.filter(course => {
              const courseNumber = course.code.split(' ')[1]; // Get number part of course code
              return courseNumber === number;
            });
          } catch (error) {
            console.warn(`Failed to fetch courses for ${searchPattern}:`, error);
          }
        }
      }

      return allCourses;
    } catch (error) {
      console.error('Error searching for course by code:', error);
      return [];
    }
  }

  async searchCoursesByKeyword(keyword) {
    if (!keyword || typeof keyword !== 'string' || keyword.trim().length < 2) {
      return [];
    }

    try {
      const searchTerm = keyword.trim().toLowerCase();
      const allCourses = [];
      
      // Get common subject codes to search through
      const commonSubjects = [
        '198', // Computer Science
        '640', // Mathematics
        '750', // Physics
        '160', // Chemistry
        '119', // Biology
        '013', // Anthropology
        '510', // History
        '830', // Political Science
        '790', // Psychology
        '920', // Sociology
        '730', // Philosophy
        '350', // English
        '420', // Art History
        '700', // Music
        '355', // Writing
        '960'  // Statistics
      ];

      const currentSemester = this.getCurrentSemesterCode();
      
      // Search through common subjects
      for (const subject of commonSubjects) {
        try {
          const courses = await this.getOfficialSOCData(subject, currentSemester);
          const matchingCourses = courses.filter(course => {
            const courseName = course.name?.toLowerCase() || '';
            const courseDescription = course.description?.toLowerCase() || '';
            const courseCode = course.code?.toLowerCase() || '';
            
            return courseName.includes(searchTerm) || 
                   courseDescription.includes(searchTerm) || 
                   courseCode.includes(searchTerm);
          });
          
          allCourses.push(...matchingCourses);
        } catch (error) {
          console.warn(`Failed to search subject ${subject}:`, error);
        }
      }

      // Remove duplicates and limit results
      const uniqueCourses = allCourses.filter((course, index, self) => 
        index === self.findIndex(c => c.code === course.code)
      );

      return uniqueCourses.slice(0, 20); // Limit to 20 results
    } catch (error) {
      console.error('Error searching courses by keyword:', error);
      return [];
    }
  }
}

const rutgersDataService = new RutgersDataService();
export default rutgersDataService; 