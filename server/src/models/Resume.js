import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  instituteName: { type: String, required: true },
  degree: { type: String, required: true },
  branch: { type: String },
  cgpa: { type: String },
  percentage: { type: String },
  marks10th: { type: String },
  marks12th: { type: String },
  passingYear: { type: String },
  currentSemester: { type: String },
  expectedGraduation: { type: String }
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  duration: { type: String },
  responsibilities: { type: String }, // Stored as a paragraph or newline-separated points
  technologiesUsed: { type: String }, // Comma-separated or tags
  achievements: { type: String }
});

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  projectDescription: { type: String },
  technologies: { type: String }, // Comma-separated or tags
  githubLink: { type: String },
  liveLink: { type: String },
  role: { type: String },
  duration: { type: String },
  majorFeatures: { type: String },
  challenges: { type: String },
  outcome: { type: String }
});

const certificationSchema = new mongoose.Schema({
  certificateName: { type: String, required: true },
  platform: { type: String },
  completionDate: { type: String },
  credentialLink: { type: String }
});

const languageSchema = new mongoose.Schema({
  language: { type: String, required: true },
  proficiency: { type: String } // e.g., Beginner, Intermediate, Fluent, Native
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'My Resume'
  },
  templateId: {
    type: String,
    default: 'modern'
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
    address: { type: String },
    dateOfBirth: { type: String },
    profilePhoto: { type: String } // base64 or file upload path
  },
  summary: { type: String },
  education: [educationSchema],
  skills: {
    programmingLanguages: { type: String, default: '' },
    frameworks: { type: String, default: '' },
    libraries: { type: String, default: '' },
    databases: { type: String, default: '' },
    tools: { type: String, default: '' },
    cloud: { type: String, default: '' },
    softSkills: { type: String, default: '' }
  },
  experience: [experienceSchema],
  projects: [projectSchema],
  achievements: [{ type: String }],
  certifications: [certificationSchema],
  languages: [languageSchema],
  interests: [{ type: String }],
  extracurricularActivities: [{ type: String }],
  completionPercentage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
