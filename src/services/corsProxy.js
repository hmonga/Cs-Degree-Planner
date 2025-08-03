// CORS Proxy Service for Rutgers API calls
// Since the Rutgers API doesn't support CORS, we need to use a proxy

class CorsProxyService {
  // Use a public CORS proxy
  async fetchWithProxy(url) {
    try {
      // Option 1: Use a public CORS proxy
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Origin': window.location.origin,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CORS proxy error:', error);
      
      // Option 2: Fallback to mock data if proxy fails
      console.warn('Falling back to mock data due to CORS restrictions');
      return this.getMockData();
    }
  }

  // Mock data for when API is unavailable
  getMockData() {
    return [
      {
        subject: "198",
        number: "111",
        title: "Introduction to Computer Science",
        credits: 4,
        description: "Introduction to computer science and programming",
        preReqNotes: null,
        semester: "92025",
        professor: "Various",
        campus: "NB",
        synopsisUrl: "http://www.cs.rutgers.edu/undergraduate/courses/",
        notes: null
      },
      {
        subject: "198",
        number: "112",
        title: "Data Structures",
        credits: 4,
        description: "Data structures and algorithms",
        preReqNotes: "CS 111",
        semester: "92025",
        professor: "Various",
        campus: "NB",
        synopsisUrl: "http://www.cs.rutgers.edu/undergraduate/courses/",
        notes: null
      },
      {
        subject: "198",
        number: "205",
        title: "Introduction to Discrete Structures I",
        credits: 4,
        description: "Discrete mathematics for computer science",
        preReqNotes: "CS 111",
        semester: "92025",
        professor: "Various",
        campus: "NB",
        synopsisUrl: "http://www.cs.rutgers.edu/undergraduate/courses/",
        notes: null
      },
      {
        subject: "640",
        number: "151",
        title: "Calculus I for Mathematical and Physical Sciences",
        credits: 4,
        description: "Differential calculus",
        preReqNotes: null,
        semester: "92025",
        professor: "Various",
        campus: "NB",
        synopsisUrl: "https://math.rutgers.edu/",
        notes: null
      },
      {
        subject: "640",
        number: "152",
        title: "Calculus II for Mathematical and Physical Sciences",
        credits: 4,
        description: "Integral calculus",
        preReqNotes: "MATH 151",
        semester: "92025",
        professor: "Various",
        campus: "NB",
        synopsisUrl: "https://math.rutgers.edu/",
        notes: null
      },
      {
        subject: "750",
        number: "193",
        title: "Physics for the Sciences",
        credits: 4,
        description: "Physics fundamentals",
        preReqNotes: "MATH 151",
        semester: "92025",
        professor: "Various",
        campus: "NB",
        synopsisUrl: "https://physics.rutgers.edu/",
        notes: null
      }
    ];
  }
}

const corsProxyService = new CorsProxyService();
export default corsProxyService; 