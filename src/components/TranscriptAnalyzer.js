import React, { useState } from 'react';
import { Upload, FileText, Bot, CheckCircle, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const TranscriptAnalyzer = ({ onCoursesIdentified, completedCourses }) => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf' && selectedFile.type !== 'text/plain') {
      setError('Please upload a PDF or text file');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }
    
    setFile(selectedFile);
    setError('');
    setAnalysisResult(null);
  };

  const analyzeTranscript = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError('');
    setAnalysisResult(null);

    try {
      console.log('Starting transcript analysis...');
      
      // Convert file to text
      console.log('Extracting text from file...');
      const text = await extractTextFromFile(file);
      console.log('Text extracted, length:', text.length);
      
      // Send to ChatGPT API
      console.log('Sending to ChatGPT API...');
      const courses = await analyzeWithChatGPT(text);
      console.log('Courses received:', courses);
      
      setAnalysisResult(courses);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Failed to analyze transcript: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const extractTextFromFile = async (file) => {
    if (file.type === 'text/plain') {
      return await file.text();
    } else if (file.type === 'application/pdf') {
      // For PDF files, we'll send the file to our server for parsing
      const formData = new FormData();
      formData.append('transcript', file);
      
      console.log('Sending PDF to server for parsing...');
      const response = await fetch('http://localhost:3001/api/parse-pdf', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('PDF parsing failed:', response.status, errorData);
        throw new Error(`Failed to parse PDF: ${response.status} ${errorData}`);
      }
      
      const data = await response.json();
      console.log('PDF parsed successfully, text length:', data.text.length);
      return data.text;
    }
    throw new Error('Unsupported file type');
  };

  const analyzeWithChatGPT = async (transcriptText) => {
    console.log('Sending transcript to ChatGPT API...');
    const response = await fetch('http://localhost:3001/api/analyze-transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: transcriptText,
        completedCourses: completedCourses.map(c => c.code)
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ChatGPT API failed:', response.status, errorData);
      throw new Error(`Failed to analyze transcript: ${response.status} ${errorData}`);
    }

    const data = await response.json();
    console.log('ChatGPT API response:', data);
    return data.courses;
  };

  const applyCourses = () => {
    if (analysisResult && analysisResult.length > 0) {
      onCoursesIdentified(analysisResult);
      setAnalysisResult(null);
      setFile(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Transcript Analyzer</h3>
          <p className="text-sm text-gray-600">Upload your unofficial transcript and let AI identify your completed courses</p>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-purple-400 bg-purple-50' 
            : file 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!file ? (
          <div>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop your transcript here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports PDF and text files (max 10MB)
            </p>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
              className="hidden"
              id="transcript-upload"
            />
            <label
              htmlFor="transcript-upload"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 cursor-pointer transition-colors"
            >
              Choose File
            </label>
          </div>
        ) : (
          <div>
            <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {file.name}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Ready to analyze
            </p>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Choose different file
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Analyze Button */}
      {file && !isAnalyzing && !analysisResult && (
        <div className="mt-6 text-center">
          <button
            onClick={analyzeTranscript}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Analyze with AI
          </button>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Analyzing transcript...
          </div>
          <p className="text-sm text-gray-500 mt-2">
            This may take a few moments
          </p>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-700">
                Found {analysisResult.length} completed courses!
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Identified Courses:</h4>
            <div className="space-y-2">
              {analysisResult.map((course, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded px-3 py-2">
                  <div>
                    <span className="font-medium text-gray-900">{course.code}</span>
                    <span className="text-gray-500 ml-2">- {course.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{course.credits} credits</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={applyCourses}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Apply to My Progress
            </button>
            <button
              onClick={() => setAnalysisResult(null)}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-800">Privacy & Security</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your transcript is processed securely and not stored. The AI only extracts course information to help you track your progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranscriptAnalyzer; 