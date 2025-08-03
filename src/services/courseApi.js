// Rutgers Course API Service
// Based on the API documentation provided

const API_BASE_URL = 'https://7cpgmnapaf.execute-api.us-east-1.amazonaws.com/PoC';

class CourseApiService {
  // Get courses by subject and semester
  async getCoursesBySubject(subject, semester, campus = 'NB', level = 'UG') {
    try {
      const params = new URLSearchParams({
        subject,
        semester,
        campus,
        level
      });
      
      const response = await fetch(`${API_BASE_URL}?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.transformCourseData(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  // Get CS courses for current semester
  async getCSCourses(semester = '12018') {
    return this.getCoursesBySubject('198', semester); // 198 is CS subject code
  }

  // Get Math courses
  async getMathCourses(semester = '12018') {
    return this.getCoursesBySubject('640', semester); // 640 is MATH subject code
  }

  // Get Physics courses
  async getPhysicsCourses(semester = '12018') {
    return this.getCoursesBySubject('750', semester); // 750 is PHYS subject code
  }

  // Transform API data to match your app's format
  transformCourseData(apiData) {
    if (!apiData || !Array.isArray(apiData)) {
      return [];
    }

    return apiData.map(course => ({
      code: `${course.subject} ${course.number}`,
      name: course.title || course.expandedTitle,
      credits: course.credits,
      description: course.description,
      prerequisites: course.preReqNotes,
      semester: this.getSemesterName(course.semester),
      professor: course.professor,
      campus: course.campus,
      synopsisUrl: course.synopsisUrl,
      notes: course.notes
    }));
  }

  // Convert semester code to readable name
  getSemesterName(semesterCode) {
    const semesterMap = {
      '12018': 'Spring 2018',
      '12019': 'Spring 2019',
      '12020': 'Spring 2020',
      '12021': 'Spring 2021',
      '12022': 'Spring 2022',
      '12023': 'Spring 2023',
      '12024': 'Spring 2024',
      '12025': 'Spring 2025',
      '92018': 'Fall 2018',
      '92019': 'Fall 2019',
      '92020': 'Fall 2020',
      '92021': 'Fall 2021',
      '92022': 'Fall 2022',
      '92023': 'Fall 2023',
      '92024': 'Fall 2024',
      '92025': 'Fall 2025'
    };
    return semesterMap[semesterCode] || semesterCode;
  }

  // Get current semester code
  getCurrentSemesterCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 0-indexed
    
    // Spring semester (1) or Fall semester (9)
    const semester = month >= 1 && month <= 5 ? '1' : '9';
    return `${semester}${year}`;
  }

  // Search courses by keyword
  async searchCourses(keyword, semester = null) {
    try {
      const currentSemester = semester || this.getCurrentSemesterCode();
      
      // Get courses from multiple subjects
      const [csCourses, mathCourses, physicsCourses] = await Promise.all([
        this.getCSCourses(currentSemester),
        this.getMathCourses(currentSemester),
        this.getPhysicsCourses(currentSemester)
      ]);

      const allCourses = [...csCourses, ...mathCourses, ...physicsCourses];
      
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

  // Get course availability for planning
  async getCourseAvailability(courseCode, semester = null) {
    try {
      const currentSemester = semester || this.getCurrentSemesterCode();
      const [subject, number] = courseCode.split(' ');
      
      // Map subject names to codes
      const subjectMap = {
        'CS': '198',
        'MATH': '640',
        'PHYS': '750'
      };
      
      const subjectCode = subjectMap[subject];
      if (!subjectCode) {
        throw new Error(`Unknown subject: ${subject}`);
      }

      const courses = await this.getCoursesBySubject(subjectCode, currentSemester);
      return courses.filter(course => course.code === courseCode);
    } catch (error) {
      console.error('Error getting course availability:', error);
      throw error;
    }
  }
}

export default new CourseApiService(); 