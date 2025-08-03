import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, CheckCircle, Plus, Minus, LogOut, Info, Trophy, Zap, Coffee, User } from 'lucide-react';
import './App.css';
import AcademicCalendar from './components/AcademicCalendar';
import Auth from './components/Auth';
import TranscriptAnalyzer from './components/TranscriptAnalyzer';
import PaymentSupport from './components/PaymentSupport';

import { authService, progressService } from './services/supabase';

const CS_REQUIREMENTS = {
  totalCredits: 120,
  coreRequirements: {
    computerScience: {
      name: "Computer Science Core",
      credits: 20,
      description: "Core CS courses required for the major",
      courses: [
        { code: "01:198:111", name: "Introduction to Computer Science", credits: 4, semester: "Fall/Spring", prereqs: [], difficulty: "medium" },
        { code: "01:198:112", name: "Data Structures", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:111"], difficulty: "medium" },
        { code: "01:198:205", name: "Introduction to Discrete Structures I", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:111"], difficulty: "hard" },
        { code: "01:198:211", name: "Computer Architecture", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:111"], difficulty: "medium" },
        { code: "01:198:344", name: "Design and Analysis of Computer Algorithms", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112", "01:198:205"], difficulty: "hard" }
      ]
    },
    csAdditional: {
      name: "CS Additional Requirement",
      credits: 3,
      description: "1 course from the following options (3-4 credits depending on choice)",
      courses: [
        { code: "01:198:206", name: "Introduction to Discrete Structures II", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:205"], difficulty: "hard" },
        { code: "01:640:477", name: "Mathematical Theory of Probability", credits: 4, semester: "Fall/Spring", prereqs: ["01:640:152"], difficulty: "hard" },
        { code: "14:332:226", name: "Probability and Random Processes", credits: 3, semester: "Fall/Spring", prereqs: [], difficulty: "hard" }
      ]
    },
    mathematics: {
      name: "Mathematics Requirements",
      credits: 11,
      description: "Mathematics foundation courses required for CS major",
      courses: [
        { code: "01:640:151", name: "Calculus I for Mathematical and Physical Sciences", credits: 4, semester: "Fall/Spring", prereqs: [], difficulty: "medium" },
        { code: "01:640:152", name: "Calculus II for Mathematical and Physical Sciences", credits: 4, semester: "Fall/Spring", prereqs: ["01:640:151"], difficulty: "medium" },
        { code: "01:640:250", name: "Introductory Linear Algebra", credits: 3, semester: "Fall/Spring", prereqs: ["01:640:151"], difficulty: "medium" }
      ]
    },
    physics: {
      name: "Physics or Chemistry",
      credits: 8,
      description: "Choose one sequence from the options below. Most students take the Physics for the Sciences sequence (01:750:193 + 01:750:194).",
      sequences: [
        {
          name: "Physics for the Sciences",
          description: "2 courses from {01:750:193, 01:750:194}",
          requiredCourses: 2,
          totalCredits: 5,
          courses: [
            {
              code: "01:750:193",
              name: "Physics for the Sciences",
              credits: 4,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: []
            },
            {
              code: "01:750:194",
              name: "Physics for the Sciences Laboratory",
              credits: 1,
              semester: "Fall/Spring",
              difficulty: "easy",
              prereqs: ["01:750:193"]
            }
          ]
        },
        {
          name: "Honors Physics",
          description: "4 courses from {01:750:271, 01:750:272, 01:750:275, 01:750:276}",
          requiredCourses: 4,
          totalCredits: 10,
          courses: [
            {
              code: "01:750:271",
              name: "Honors Physics I",
              credits: 3,
              semester: "Fall/Spring",
              difficulty: "hard",
              prereqs: []
            },
            {
              code: "01:750:272",
              name: "Honors Physics II",
              credits: 3,
              semester: "Fall/Spring",
              difficulty: "hard",
              prereqs: ["01:750:271"]
            },
            {
              code: "01:750:275",
              name: "Honors Physics Laboratory I",
              credits: 2,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: ["01:750:271"]
            },
            {
              code: "01:750:276",
              name: "Honors Physics Laboratory II",
              credits: 2,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: ["01:750:272"]
            }
          ]
        },
        {
          name: "General Physics",
          description: "4 courses from {01:750:203, 01:750:204, 01:750:205, 01:750:206}",
          requiredCourses: 4,
          totalCredits: 8,
          courses: [
            {
              code: "01:750:203",
              name: "General Physics I",
              credits: 3,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: []
            },
            {
              code: "01:750:204",
              name: "General Physics II",
              credits: 3,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: ["01:750:203"]
            },
            {
              code: "01:750:205",
              name: "General Physics Laboratory I",
              credits: 1,
              semester: "Fall/Spring",
              difficulty: "easy",
              prereqs: ["01:750:203"]
            },
            {
              code: "01:750:206",
              name: "General Physics Laboratory II",
              credits: 1,
              semester: "Fall/Spring",
              difficulty: "easy",
              prereqs: ["01:750:204"]
            }
          ]
        },
        {
          name: "Analytical Physics",
          description: "4 courses from {01:750:123, 01:750:124, 01:750:227, 01:750:229}",
          requiredCourses: 4,
          totalCredits: 8,
          courses: [
            {
              code: "01:750:123",
              name: "Analytical Physics I",
              credits: 2,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: []
            },
            {
              code: "01:750:124",
              name: "Analytical Physics II",
              credits: 2,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: ["01:750:123"]
            },
            {
              code: "01:750:227",
              name: "Analytical Physics III",
              credits: 3,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: ["01:750:124"]
            },
            {
              code: "01:750:229",
              name: "Analytical Physics Laboratory",
              credits: 1,
              semester: "Fall/Spring",
              difficulty: "easy",
              prereqs: ["01:750:227"]
            }
          ]
        },
        {
          name: "Chemistry for Engineers",
          description: "3 courses from {01:160:159, 01:160:160, 01:160:171}",
          requiredCourses: 3,
          totalCredits: 7,
          courses: [
            {
              code: "01:160:159",
              name: "General Chemistry for Engineers",
              credits: 3,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: []
            },
            {
              code: "01:160:160",
              name: "General Chemistry for Engineers",
              credits: 3,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: ["01:160:159"]
            },
            {
              code: "01:160:171",
              name: "General Chemistry Laboratory",
              credits: 1,
              semester: "Fall/Spring",
              difficulty: "easy",
              prereqs: ["01:160:159"]
            }
          ]
        },
        {
          name: "General Chemistry",
          description: "3 courses from {01:160:161, 01:160:162, 01:160:171}",
          requiredCourses: 3,
          totalCredits: 9,
          courses: [
            {
              code: "01:160:161",
              name: "General Chemistry",
              credits: 4,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: []
            },
            {
              code: "01:160:162",
              name: "General Chemistry",
              credits: 4,
              semester: "Fall/Spring",
              difficulty: "medium",
              prereqs: ["01:160:161"]
            },
            {
              code: "01:160:171",
              name: "General Chemistry Laboratory",
              credits: 1,
              semester: "Fall/Spring",
              difficulty: "easy",
              prereqs: ["01:160:161"]
            }
          ]
        }
      ]
    },
    contemporaryChallenges: {
      name: "Contemporary Challenges [CC]",
      credits: 7, // 2 courses: 4 + 3 credits
      description: "2 courses: 1 from Our Common Future + 1 from Diversities and Social Inequalities",
      courses: [
        { code: "01:198:142", name: "Contemporary Challenges: Our Common Future", credits: 4, semester: "Fall/Spring", prereqs: [], difficulty: "medium", category: "CC-O" },
        { code: "01:013:308", name: "Contemporary Challenges: Diversity and Social Inequalities", credits: 3, semester: "Fall/Spring", prereqs: [], difficulty: "medium", category: "CC-D" }
      ],
      categories: [
        { name: "Our Common Future [CC-O]", credits: 4, description: "Contemporary global issues and technology" },
        { name: "Diversities and Social Inequalities [CC-D]", credits: 3, description: "Social justice and power systems" }
      ]
    },
    naturalSciences: {
      name: "Natural Sciences [NS]",
      credits: 8, // 2 courses × 4 credits
      description: "2 courses from physical or biological sciences (excluding Physics/Chemistry which are in major requirements)"
    },
    socialHistorical: {
      name: "Social & Historical Analysis [SCL/HST]",
      credits: 6, // 2 courses × 3 credits
      description: "1 course from each: Historical Analysis + Social Analysis"
    },
    artsHumanities: {
      name: "Arts & Humanities [AH]",
      credits: 6, // 2 courses × 3 credits
      description: "2 courses from different categories: Human Experience, Arts/Literatures, Nature of Languages, or Critical Creative Expression"
    },
    writingCommunication: {
      name: "Writing & Communication [WC]",
      credits: 9,
      description: "3 courses: College Writing + Revision-Based + Discipline-Based"
    },
    quantitativeReasoning: {
      name: "Quantitative & Formal Reasoning [QQ/QR]",
      credits: 8, // 2 courses: 4 + 4 credits (based on Degree Navigator showing 01:198:111 and 01:198:142)
      description: "2 courses: Quantitative Information + Mathematical Reasoning"
    },
    electives: {
      name: "Computer Science Electives",
      credits: 28, // 7 courses × 4 credits
      description: "A CS Advisor will help you make selections from this list to complete your CS major. Many electives are offered only once per year.",
      courses: [
        { code: "01:198:210", name: "Data Management for Data Science", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:213", name: "Software Methodology", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:214", name: "Systems Programming", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "hard" },
        { code: "01:198:314", name: "Principles of Programming Languages", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "hard" },
        { code: "01:198:323", name: "Numerical Analysis and Computing", credits: 4, semester: "Fall/Spring", prereqs: ["01:640:152"], difficulty: "hard" },
        { code: "01:198:324", name: "Numerical Methods", credits: 4, semester: "Fall/Spring", prereqs: ["01:640:152"], difficulty: "hard" },
        { code: "01:198:334", name: "Introduction to Imaging and Multimedia", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:336", name: "Principles of Information and Data Management", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:352", name: "Internet Technology", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:411", name: "Computer Architecture II", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:211"], difficulty: "hard" },
        { code: "01:198:415", name: "Compilers", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:314"], difficulty: "hard" },
        { code: "01:198:416", name: "Operating Systems Design", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:214"], difficulty: "hard" },
        { code: "01:198:417", name: "Distributed Systems: Concepts and Design", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:416"], difficulty: "hard" },
        { code: "01:198:419", name: "Computer Security", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "hard" },
        { code: "01:198:424", name: "Modeling and Simulation of Continuous Systems", credits: 4, semester: "Fall/Spring", prereqs: ["01:640:152"], difficulty: "hard" },
        { code: "01:198:425", name: "Brain-Inspired Computing", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "hard" },
        { code: "01:198:428", name: "Introduction to Computer Graphics", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:431", name: "Software Engineering", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:213"], difficulty: "medium" },
        { code: "01:198:437", name: "Database Systems Implementation", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:336"], difficulty: "hard" },
        { code: "01:198:439", name: "Introduction to Data Science", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:440", name: "Introduction to Artificial Intelligence", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "hard" },
        { code: "01:198:442", name: "Topics in Computer Science", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:443", name: "Topics in Computer Science", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:444", name: "Topics in Computer Science", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:445", name: "Topics in Computer Science", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "medium" },
        { code: "01:198:452", name: "Formal Languages and Automata", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:206"], difficulty: "hard" },
        { code: "01:198:460", name: "Introduction to Computational Robotics", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "hard" },
        { code: "01:198:461", name: "Machine Learning Principles", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:112"], difficulty: "hard" },
        { code: "01:198:462", name: "Introduction to Deep Learning", credits: 4, semester: "Fall/Spring", prereqs: ["01:198:461"], difficulty: "hard" },
        { code: "01:198:493", name: "Independent Study in Computer Science", credits: 4, semester: "Fall/Spring", prereqs: [], difficulty: "medium" },
        { code: "01:198:494", name: "Independent Study in Computer Science", credits: 4, semester: "Fall/Spring", prereqs: [], difficulty: "medium" }
      ]
    }
  }
};

function App() {
  const [completedCourses, setCompletedCourses] = useState([]);
  const [currentSemester] = useState('Fall 2025');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('computerScience');

  const [activeTab, setActiveTab] = useState('progress');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Calculate progress
  const calculateProgress = () => {
    const totalCompleted = completedCourses.reduce((sum, course) => sum + course.credits, 0);
    const percentage = (totalCompleted / CS_REQUIREMENTS.totalCredits) * 100;
    return { completed: totalCompleted, percentage: Math.round(percentage) };
  };

  const getCompletedCreditsByCategory = (category) => {
    if (category === 'computerScience') {
      return completedCourses
        .filter(course => CS_REQUIREMENTS.coreRequirements.computerScience.courses
          .some(reqCourse => reqCourse.code === course.code))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    if (category === 'csAdditional') {
      return completedCourses
        .filter(course => CS_REQUIREMENTS.coreRequirements.csAdditional.courses
          .some(reqCourse => reqCourse.code === course.code))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    if (category === 'mathematics') {
      return completedCourses
        .filter(course => CS_REQUIREMENTS.coreRequirements.mathematics.courses
          .some(reqCourse => reqCourse.code === course.code))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    if (category === 'physics') {
      return completedCourses
        .filter(course => CS_REQUIREMENTS.coreRequirements.physics.sequences
          .some(seq => seq.courses.some(c => c.code === course.code)))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    if (category === 'contemporaryChallenges') {
      return completedCourses
        .filter(course => CS_REQUIREMENTS.coreRequirements.contemporaryChallenges.courses
          .some(reqCourse => reqCourse.code === course.code))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    if (category === 'naturalSciences') {
      // For simplified categories, count generic course entries
      return completedCourses
        .filter(course => course.code && course.code.startsWith('naturalSciences_'))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    if (category === 'socialHistorical') {
      return completedCourses
        .filter(course => course.code && course.code.startsWith('socialHistorical_'))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    if (category === 'artsHumanities') {
      return completedCourses
        .filter(course => course.code && course.code.startsWith('artsHumanities_'))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    if (category === 'writingCommunication') {
      return completedCourses
        .filter(course => course.code && course.code.startsWith('writingCommunication_'))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    if (category === 'quantitativeReasoning') {
      return completedCourses
        .filter(course => course.code && course.code.startsWith('quantitativeReasoning_'))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    if (category === 'electives') {
      return completedCourses
        .filter(course => CS_REQUIREMENTS.coreRequirements.electives.courses
          .some(reqCourse => reqCourse.code === course.code))
        .reduce((sum, course) => sum + course.credits, 0);
    }
    return 0;
  };



  const isCSAdditionalCourseLocked = (courseCode) => {
    const csAdditionalCourses = ['01:198:206', '01:640:477', '14:332:226'];
    if (!csAdditionalCourses.includes(courseCode)) return false;
    
    const completedCSAdditional = completedCourses.filter(c => csAdditionalCourses.includes(c.code));
    return completedCSAdditional.length > 0 && !completedCSAdditional.some(c => c.code === courseCode);
  };

  const getWebRegUrl = (courseCode) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    let semester = '9'; // Fall by default
    
    if (currentMonth >= 1 && currentMonth <= 4) {
      semester = '1'; // Spring
    } else if (currentMonth >= 5 && currentMonth <= 8) {
      semester = '7'; // Summer
    }
    
    return `https://sims.rutgers.edu/webreg/editSchedule.htm?login=cas&semesterSelection=${currentYear}${semester}&indexList=${courseCode.replace(/:/g, '')}`;
  };

  const getRateMyProfessorsUrl = (courseCode) => {
    if (courseCode.includes('198:')) {
      return `https://www.ratemyprofessors.com/search/professors/1260?q=${courseCode}`;
    }
    return null;
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await authService.getCurrentUser();
        if (user) {
          setUser(user);
          const { data: userCourses } = await progressService.getCompletedCourses(user.id);
          if (userCourses) {
            setCompletedCourses(userCourses.map(course => ({
              code: course.course_code,
              name: course.course_name,
              credits: course.credits,
              semester: course.semester
            })));
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000);

    checkUser();

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user);
        setUser(session.user);
        
        const { data: userCourses } = await progressService.getCompletedCourses(session.user.id);
        if (userCourses) {
          setCompletedCourses(userCourses.map(course => ({
            code: course.course_code,
            name: course.course_name,
            credits: course.credits,
            semester: course.semester
          })));
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state');
        setUser(null);
        setCompletedCourses([]);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
        }
      });
    }, observerOptions);

    // Observe all cards and sections
    const elements = document.querySelectorAll('.card, .stats-card, .course-card');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Add magnetic effect to buttons
  useEffect(() => {
    const buttons = document.querySelectorAll('.magnetic-button');
    
    buttons.forEach(button => {
      button.addEventListener('mousemove', (e) => {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        button.style.setProperty('--mouse-x', `${x * 0.1}px`);
        button.style.setProperty('--mouse-y', `${y * 0.1}px`);
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.setProperty('--mouse-x', '0px');
        button.style.setProperty('--mouse-y', '0px');
      });
    });

    return () => {
      buttons.forEach(button => {
        button.removeEventListener('mousemove', () => {});
        button.removeEventListener('mouseleave', () => {});
      });
    };
  }, []);

  const handleAuthSuccess = (user) => {
    setUser(user);
  };

  const handleSignOut = async () => {
    console.log('Sign out button clicked');
    try {
      console.log('Current user before sign out:', user);
      
      // Clear state immediately for better UX
      setUser(null);
      setCompletedCourses([]);
      
      // Then sign out from Supabase
      const { error } = await authService.signOut();
      console.log('Sign out response:', { error });
      
      if (error) {
        console.error('Sign out error:', error);
        // If there's an error, we might want to show a message to the user
      } else {
        console.log('Sign out successful');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  const addCompletedCourse = async (courseCode) => {
    let course;
    
    if (CS_REQUIREMENTS.coreRequirements[courseCode] && !CS_REQUIREMENTS.coreRequirements[courseCode].courses) {
      const categoryName = CS_REQUIREMENTS.coreRequirements[courseCode].name;
      course = {
        code: `${courseCode}_course`,
        name: `${categoryName} Course`,
        credits: CS_REQUIREMENTS.coreRequirements[courseCode].credits,
        semester: "Fall/Spring"
      };
    } else {
              // Find the course in any category that has individual courses
        for (const [, category] of Object.entries(CS_REQUIREMENTS.coreRequirements)) {
        if (category.courses) {
          const foundCourse = category.courses.find(c => c.code === courseCode);
          if (foundCourse) {
            course = foundCourse;
            break;
          }
        }
      }
    }
    
    if (course && !completedCourses.some(c => c.code === course.code) && user) {
      try {
        if (courseCode === '01:198:206' || courseCode === '01:640:477' || courseCode === '14:332:226') {
          const csAdditionalCourses = ['01:198:206', '01:640:477', '14:332:226'];
          const updatedCourses = completedCourses.filter(c => !csAdditionalCourses.includes(c.code));
          setCompletedCourses([...updatedCourses, course]);
          
                    try {
            for (const existingCourse of completedCourses.filter(c => csAdditionalCourses.includes(c.code))) {
              await progressService.removeCompletedCourse(user.id, existingCourse.code);
            }
            // Add the new course
            await progressService.addCompletedCourse(
              user.id,
              course.code,
              course.name,
              course.credits,
              currentSemester
            );
          } catch (error) {
            console.error('Supabase sync failed (but local state updated):', error);
          }
        } else {
          // Regular course addition
          setCompletedCourses(prev => [...prev, course]);
          
          // Then sync to Supabase in the background
          try {
            await progressService.addCompletedCourse(
              user.id,
              course.code,
              course.name,
              course.credits,
              currentSemester
            );
          } catch (error) {
            console.error('Supabase sync failed (but local state updated):', error);
          }
        }
      } catch (error) {
        console.error('Error adding course:', error);
      }
    }
  };

  const removeCompletedCourse = async (courseCode) => {
    if (user) {
      try {
        // For simplified categories, we need to find the actual course code
        let actualCourseCode = courseCode;
        
        // Check if courseCode is actually a category name (for simplified categories)
        if (CS_REQUIREMENTS.coreRequirements[courseCode] && !CS_REQUIREMENTS.coreRequirements[courseCode].courses) {
          // For simplified categories, find the generic course
          const genericCourse = completedCourses.find(c => c.code === `${courseCode}_course`);
          if (genericCourse) {
            actualCourseCode = genericCourse.code;
          }
        } else {
          // For categories with individual courses, use the courseCode directly
          actualCourseCode = courseCode;
        }
        
        // Update local state first for immediate feedback
        setCompletedCourses(prev => prev.filter(c => c.code !== actualCourseCode));
        
        // Then sync to Supabase in the background
        try {
          await progressService.removeCompletedCourse(user.id, actualCourseCode);
        } catch (error) {
          console.error('Supabase sync failed (but local state updated):', error);
        }
      } catch (error) {
        console.error('Error removing course:', error);
      }
    }
  };

  const progress = calculateProgress();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }



  return (
    <div className="min-h-screen">
      {/* Modern Header */}
      <header className="modern-header text-white shadow-2xl relative overflow-hidden">
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 group animate-fade-in-left">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 hover-glow">
                  {/* Your logo */}
                  <img 
                    src="/download.png" 
                    alt="Rutgers Degree Planner Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold group-hover:text-yellow-200 transition-colors duration-300 gradient-text typing-effect">
                  Rutgers CS Degree Planner
                </h1>
                <p className="text-white/80 flex items-center space-x-2 mt-1 animate-fade-in-up stagger-1">
                  <Zap className="w-4 h-4 animate-pulse-slow" />
                  <span className="font-medium">Track your progress to graduation</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-16 animate-fade-in-right">
              <div className="text-right group hover:scale-105 transition-transform duration-300">
                <div className="text-sm text-white/70 flex items-center space-x-2">
                  <Coffee className="w-4 h-4" />
                  <span>Current Semester</span>
                </div>
                <div className="font-semibold text-lg">{currentSemester}</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right group hover:scale-105 transition-transform duration-300">
                  <div className="text-sm text-white/70 flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Welcome</span>
                  </div>
                  <div className="font-semibold text-lg">{user.email}</div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn btn-secondary bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg group ripple magnetic-button"
                >
                  <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Data Accuracy Notice */}
        <div className="mb-6 animate-fade-in-up">
          <div className="glass border-l-4 border-blue-400 p-4 rounded-r-lg shadow-lg">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0 animate-pulse-slow" />
              <div className="text-sm text-blue-800">
                <strong>Data Accuracy Notice:</strong> Verify all course information with official Rutgers sources before registration. 
                <span className="ml-2 text-xs animate-glow">💡 Use the WebReg and RateMyProfessors links on each course card for more information!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Discrepancy Notice */}
        <div className="mb-6 animate-fade-in-up">
          <div className="glass border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-lg">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0 animate-pulse-slow" />
              <div className="text-sm text-yellow-800">
                <strong>Credit Calculation Note:</strong> This app tracks degree progress and may show slightly different credit totals than your official transcript. 
                <span className="ml-2 text-xs animate-glow">📊 The app focuses on degree requirements, while transcripts include all courses taken.</span>
              </div>
            </div>
          </div>
        </div>

                {/* Modern Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="modern-nav flex space-x-1 p-4">
            <button
              onClick={() => setActiveTab('progress')}
              className={`modern-nav-item ${activeTab === 'progress' ? 'active' : ''}`}
            >
              📊 Degree Progress
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`modern-nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
            >
              📅 Academic Calendar
            </button>
            <button
              onClick={() => setActiveTab('transcript')}
              className={`modern-nav-item ${activeTab === 'transcript' ? 'active' : ''}`}
            >
              🤖 AI Transcript Analyzer
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`modern-nav-item ${activeTab === 'support' ? 'active' : ''}`}
            >
              💙 Support Us
            </button>
          </div>
        </div>

        {/* Progress Overview */}
        {activeTab === 'progress' && (
          <>
            {/* Fun progress celebration */}
            {progress.percentage >= 100 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-center animate-bounce-gentle">
                <div className="flex items-center justify-center space-x-2">
                  <Trophy className="w-6 h-6" />
                  <span className="text-lg font-bold">🎉 CONGRATULATIONS! You've completed your degree! 🎉</span>
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Credits Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow animate-fade-in-up stagger-1 hover-lift">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-rutgers-scarlet rounded-lg flex items-center justify-center animate-scale-in">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Total Credits</p>
                    <p className="text-2xl font-bold text-primary">
                      {progress.completed} / {CS_REQUIREMENTS.totalCredits}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-rutgers-scarlet h-2 rounded-full transition-all duration-500 progress-animated"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-secondary font-medium">
                  {progress.percentage}% Complete
                </p>
              </div>

              {/* Courses Completed Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow animate-fade-in-up stagger-2 hover-lift">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center animate-scale-in">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Courses Completed</p>
                    <p className="text-2xl font-bold text-primary">
                      {completedCourses.length}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted">
                  {completedCourses.length === 0 && "No courses yet - let's get started! 🚀"}
                  {completedCourses.length === 1 && "Great start! Keep going! 🌟"}
                  {completedCourses.length >= 2 && completedCourses.length < 5 && "Making progress! 📈"}
                  {completedCourses.length >= 5 && completedCourses.length < 10 && "Halfway there! 🎯"}
                  {completedCourses.length >= 10 && "You're crushing it! 🎯"}
                </p>
              </div>

              {/* Estimated Graduation Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow animate-fade-in-up stagger-3 hover-lift">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center animate-scale-in">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary">Estimated Graduation</p>
                    <p className="text-2xl font-bold text-primary">
                      {(() => {
                        const remainingCredits = CS_REQUIREMENTS.totalCredits - progress.completed;
                        const creditsPerSemester = 15;
                        const semestersRemaining = Math.ceil(remainingCredits / creditsPerSemester);
                        const currentYear = new Date().getFullYear();
                        const currentMonth = new Date().getMonth();
                        const isFall = currentMonth >= 8 || currentMonth <= 1;
                        
                        let graduationYear = currentYear;
                        let graduationSemester = isFall ? 'Spring' : 'Fall';
                        
                        if (semestersRemaining > 1) {
                          if (isFall) {
                            graduationYear = currentYear + 1;
                            graduationSemester = 'Fall';
                          } else {
                            graduationYear = currentYear + 1;
                            graduationSemester = 'Spring';
                          }
                        }
                        
                        if (semestersRemaining > 2) {
                          graduationYear = currentYear + Math.ceil(semestersRemaining / 2);
                        }
                        
                        return `${graduationSemester} ${graduationYear}`;
                      })()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted">
                  {progress.percentage >= 75 && "Almost there! 🎉"}
                  {progress.percentage >= 50 && progress.percentage < 75 && "Halfway point! 🎯"}
                  {progress.percentage >= 25 && progress.percentage < 50 && "Making progress! 💪"}
                  {progress.percentage < 25 && "Just getting started! 🚀"}
                </p>
              </div>
            </div>

                                     {/* Requirements Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {Object.entries(CS_REQUIREMENTS.coreRequirements).map(([key, requirement]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-8 py-6 border-b-2 font-medium text-sm transition-all duration-300 hover:scale-105 min-w-[140px] ${
                        selectedCategory === key
                          ? 'border-rutgers-scarlet text-rutgers-scarlet bg-red-50 shadow-md'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span className="text-center leading-tight">{requirement.name}</span>
                        <span className={`text-xs px-3 py-1 rounded font-medium transition-all duration-300 ${
                          selectedCategory === key
                            ? 'bg-rutgers-scarlet text-white scale-110'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {getCompletedCreditsByCategory(key)}/{requirement.credits}
                        </span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-primary">
                    {CS_REQUIREMENTS.coreRequirements[selectedCategory].name}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowAddCourse(!showAddCourse)}
                      className="btn-secondary flex items-center space-x-2 btn-bounce hover-glow"
                    >
                      {showAddCourse ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{showAddCourse ? 'Hide Courses' : 'Add Course'}</span>
                      {!showAddCourse && <span className="text-xs">✨</span>}
                    </button>
                  </div>
                </div>

                {CS_REQUIREMENTS.coreRequirements[selectedCategory].sequences ? (
                  <div className="space-y-6">
                    {/* Special note for Physics/Chemistry */}
                    {selectedCategory === 'physics' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <span className="text-blue-600 text-lg">💡</span>
                          </div>
                          <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-900">Recommended Path</h4>
                            <p className="text-sm text-blue-800 mt-1">
                              Most CS students take <strong>01:750:193 (Physics for the Sciences)</strong> and 
                              <strong>01:750:194 (Physics Lab)</strong> together in one semester. 
                              This is the most straightforward option and satisfies the requirement with just 2 courses.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {CS_REQUIREMENTS.coreRequirements[selectedCategory].sequences.map((sequence, seqIndex) => {
                      const completedInSequence = completedCourses.filter(course => 
                        sequence.courses.some(seqCourse => seqCourse.code === course.code)
                      );
                      const completedCredits = completedInSequence.reduce((sum, course) => sum + course.credits, 0);
                      const isSequenceComplete = completedInSequence.length >= sequence.requiredCourses;
                      
                      return (
                        <div key={seqIndex} className="bg-white rounded-lg border border-gray-200 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-primary">{sequence.name}</h3>
                              <p className="text-secondary text-sm mt-1">{sequence.description}</p>
                              <p className="text-muted text-xs mt-1">
                                {sequence.requiredCourses} courses required • {sequence.totalCredits} total credits
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary">
                                {completedInSequence.length}/{sequence.requiredCourses}
                              </div>
                              <div className="text-sm text-secondary">
                                {completedCredits}/{sequence.totalCredits} credits
                              </div>
                              {isSequenceComplete && (
                                <div className="text-green-600 text-sm font-medium mt-1">✓ Complete</div>
                              )}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sequence.courses
                              .map((course) => {
                                const isCompleted = completedCourses.some(c => c.code === course.code);
                                const isLocked = isCSAdditionalCourseLocked(course.code);
                                return (
                                  <div key={course.code} className={`course-card rounded-lg border p-4 transition-all duration-300 hover:scale-105 hover:lift ${
                                    isLocked 
                                      ? 'bg-gray-100 border-gray-300 opacity-60' 
                                      : 'bg-gray-50 border-gray-200 hover:shadow-lg'
                                  }`}>
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <h3 className="font-semibold text-primary text-sm">{course.code}</h3>
                                        <p className="text-secondary text-xs">{course.name}</p>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-muted text-xs">{course.credits} credits</span>
                                        <div className="text-xs text-gray-500">{course.semester}</div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex space-x-2 mb-2">
                                      <a
                                        href={getWebRegUrl(course.code)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                                      >
                                        <span>📋</span>
                                        <span>WebReg</span>
                                      </a>
                                      {getRateMyProfessorsUrl(course.code) && (
                                        <a
                                          href={getRateMyProfessorsUrl(course.code)}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors flex items-center space-x-1"
                                        >
                                          <span>⭐</span>
                                          <span>RateMyProfs</span>
                                        </a>
                                      )}
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                      {isLocked ? (
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs text-gray-500">🔒 Locked</span>
                                          <span className="text-xs text-gray-400">(Another CS Additional course selected)</span>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => isCompleted ? removeCompletedCourse(course.code) : addCompletedCourse(course.code)}
                                          className={`ripple magnetic-button px-3 py-1 text-xs rounded transition-all duration-200 ${
                                            isCompleted
                                              ? 'bg-red-500 text-white hover:bg-red-600'
                                              : 'bg-green-500 text-white hover:bg-green-600'
                                          }`}
                                        >
                                          {isCompleted ? 'Remove 😢' : 'Mark as Complete ✅'}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : CS_REQUIREMENTS.coreRequirements[selectedCategory].courses ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CS_REQUIREMENTS.coreRequirements[selectedCategory].courses
                      .map((course) => {
                        const isCompleted = completedCourses.some(c => c.code === course.code);
                        const isLocked = isCSAdditionalCourseLocked(course.code);
                        return (
                          <div key={course.code} className={`course-card rounded-lg border p-4 transition-all duration-300 hover:scale-105 hover:lift ${
                                    isLocked 
                                      ? 'bg-gray-100 border-gray-300 opacity-60' 
                                      : 'bg-gray-50 border-gray-200 hover:shadow-lg'
                                  }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold text-primary text-sm">{course.code}</h3>
                                <p className="text-secondary text-xs">{course.name}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-muted text-xs">{course.credits} credits</span>
                                <div className="text-xs text-gray-500">{course.semester}</div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 mb-2">
                              <a
                                href={getWebRegUrl(course.code)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                              >
                                <span>📋</span>
                                <span>WebReg</span>
                              </a>
                              {getRateMyProfessorsUrl(course.code) && (
                                <a
                                  href={getRateMyProfessorsUrl(course.code)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200 transition-colors flex items-center space-x-1"
                                >
                                  <span>⭐</span>
                                  <span>RateMyProfs</span>
                                </a>
                              )}
                            </div>
                            
                            <div className="flex justify-between items-center">
                              {isLocked ? (
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">🔒 Locked</span>
                                  <span className="text-xs text-gray-400">(Another CS Additional course selected)</span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => isCompleted ? removeCompletedCourse(course.code) : addCompletedCourse(course.code)}
                                  className={`ripple magnetic-button px-3 py-1 text-xs rounded transition-all duration-200 ${
                                    isCompleted
                                      ? 'bg-red-500 text-white hover:bg-red-600'
                                      : 'bg-green-500 text-white hover:bg-green-600'
                                  }`}
                                >
                                  {isCompleted ? 'Remove 😢' : 'Mark as Complete ✅'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* For categories without individual courses (like CS Core) */}
                    {!CS_REQUIREMENTS.coreRequirements[selectedCategory].categories && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">
                          {CS_REQUIREMENTS.coreRequirements[selectedCategory].name}
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">
                          {CS_REQUIREMENTS.coreRequirements[selectedCategory].description}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-secondary">Completed credits:</span>
                          <span className="text-lg font-semibold text-blue-800">
                            {getCompletedCreditsByCategory(selectedCategory)}/{CS_REQUIREMENTS.coreRequirements[selectedCategory].credits}
                          </span>
                        </div>
                        {/* External Links for SAS Core Categories */}
                        <div className="flex space-x-2 mb-3">
                          <a
                            href="https://sims.rutgers.edu/webreg/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors flex items-center space-x-1"
                          >
                            <span>📋</span>
                            <span>WebReg</span>
                          </a>
                          <a
                            href="https://sasundergrad.rutgers.edu/academics/sas-core-curriculum"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors flex items-center space-x-1"
                          >
                            <span>📚</span>
                            <span>SAS Core Guide</span>
                          </a>
                        </div>
                        
                        {showAddCourse && (
                          <div className="flex space-x-4">
                            <button
                              onClick={() => addCompletedCourse(selectedCategory)}
                              className="btn-primary flex items-center space-x-2"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Mark Course Complete</span>
                            </button>
                            <button
                              onClick={() => removeCompletedCourse(selectedCategory)}
                              className="btn-secondary flex items-center space-x-2"
                            >
                              <Minus className="w-4 h-4" />
                              <span>Remove Course</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* For categories with subcategories */}
                    {CS_REQUIREMENTS.coreRequirements[selectedCategory].categories && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">
                          {CS_REQUIREMENTS.coreRequirements[selectedCategory].name}
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">
                          {CS_REQUIREMENTS.coreRequirements[selectedCategory].description}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {CS_REQUIREMENTS.coreRequirements[selectedCategory].categories?.map((category, index) => (
                            <div key={index} className="bg-white border border-blue-200 rounded-lg p-3">
                              <h5 className="font-medium text-gray-900 mb-1">{category.name}</h5>
                              <p className="text-xs text-gray-600 mb-2">{category.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">{category.credits} credits</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {getCompletedCreditsByCategory(selectedCategory)}/{CS_REQUIREMENTS.coreRequirements[selectedCategory].credits}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Academic Calendar Tab */}
        {activeTab === 'calendar' && (
          <AcademicCalendar />
        )}

        {/* AI Transcript Analyzer Tab */}
        {activeTab === 'transcript' && (
          <TranscriptAnalyzer 
            onCoursesIdentified={(courses) => {
              // Add all identified courses to completed courses
              courses.forEach(course => {
                // Create a proper course object and add it directly
                const courseToAdd = {
                  code: course.code,
                  name: course.name,
                  credits: course.credits,
                  semester: course.semester || "Fall/Spring"
                };
                
                // Add to local state if not already present
                if (!completedCourses.some(c => c.code === courseToAdd.code)) {
                  setCompletedCourses(prev => [...prev, courseToAdd]);
                  
                  // Sync to Supabase
                  if (user) {
                    progressService.addCompletedCourse(
                      user.id,
                      courseToAdd.code,
                      courseToAdd.name,
                      courseToAdd.credits,
                      courseToAdd.semester
                    ).catch(error => {
                      console.error('Supabase sync failed:', error);
                    });
                  }
                }
              });
            }}
            completedCourses={completedCourses}
          />
        )}

        {/* Support Us Tab */}
        {activeTab === 'support' && (
          <PaymentSupport />
        )}


      </div>
    </div>
  );
}

export default App;