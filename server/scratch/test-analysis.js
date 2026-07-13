import dotenv from 'dotenv';
import { extractTextFromBuffer } from '../src/utils/parser.js';
import { analyzeResumeText } from '../src/utils/ai.js';
import fs from 'fs';

dotenv.config();

const runTest = async () => {
  console.log('Testing Parser and AI connection...');
  console.log('Gemini Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');
  
  const mockText = 'Rahul Sharma\nEmail: rahul@example.com\nPhone: +91 98765 43210\nSkills: Python, React, MongoDB\nExperience: Intern at Google';
  
  try {
    console.log('\n1. Testing analyzeResumeText with mock text...');
    const result = await analyzeResumeText(mockText);
    console.log('Gemini API Success! Response keys:', Object.keys(result));
    console.log('ATS Score:', result.atsScore);
  } catch (error) {
    console.error('Gemini API Failed! Error details:', error);
  }
};

runTest();
