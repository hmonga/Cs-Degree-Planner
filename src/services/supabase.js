import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bpvxmcyttctmqbosefhf.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdnhtY3l0dGN0bXFib3NlZmhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxODE2MDksImV4cCI6MjA2OTc1NzYwOX0.6t0LHiQIT4JwBO2-CKyF6K5fsIqkm55K77TnkN1nrAI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User authentication functions
export const authService = {
  // Sign up with email and password
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },



  // Get current user
  getCurrentUser() {
    return supabase.auth.getUser();
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// User progress tracking functions
export const progressService = {
  // Get user's completed courses
  async getCompletedCourses(userId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    return { data, error };
  },

  // Add a completed course
  async addCompletedCourse(userId, courseCode, courseName, credits, semester) {
    const { data, error } = await supabase
      .from('user_progress')
      .insert([
        {
          user_id: userId,
          course_code: courseCode,
          course_name: courseName,
          credits: credits,
          semester: semester,
          completed_at: new Date().toISOString(),
        },
      ]);

    return { data, error };
  },

  // Remove a completed course
  async removeCompletedCourse(userId, courseCode) {
    const { data, error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)
      .eq('course_code', courseCode);

    return { data, error };
  },

  // Update user profile
  async updateUserProfile(userId, profile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert([
        {
          user_id: userId,
          ...profile,
          updated_at: new Date().toISOString(),
        },
      ]);

    return { data, error };
  },

  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    return { data, error };
  },
};

export default supabase; 