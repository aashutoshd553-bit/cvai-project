import mongoose from 'mongoose';
import Resume from '../models/Resume.js';

// In-Memory fallback storage when MongoDB is disconnected
let inMemoryResumes = [];

// Helper to calculate resume completion percentage
const calculateCompletion = (resume) => {
  let score = 0;

  if (resume.personalInfo) {
    const { fullName, email, phone } = resume.personalInfo;
    if (fullName && email && phone) {
      score += 20;
    }
  }

  if (resume.summary && resume.summary.trim().length > 0) {
    score += 10;
  }

  if (resume.education && resume.education.length > 0) {
    const firstEdu = resume.education[0];
    if (firstEdu.instituteName && firstEdu.degree) {
      score += 20;
    }
  }

  if (resume.skills) {
    const { programmingLanguages, frameworks, libraries, databases, tools, cloud, softSkills } = resume.skills;
    if (
      (programmingLanguages && programmingLanguages.trim()) ||
      (frameworks && frameworks.trim()) ||
      (libraries && libraries.trim()) ||
      (databases && databases.trim()) ||
      (tools && tools.trim()) ||
      (cloud && cloud.trim()) ||
      (softSkills && softSkills.trim())
    ) {
      score += 15;
    }
  }

  if (resume.experience && resume.experience.length > 0) {
    const firstExp = resume.experience[0];
    if (firstExp.company && firstExp.role) {
      score += 15;
    }
  }

  if (resume.projects && resume.projects.length > 0) {
    const firstProj = resume.projects[0];
    if (firstProj.projectName) {
      score += 10;
    }
  }

  if (resume.achievements && resume.achievements.length > 0 && resume.achievements[0].trim()) {
    score += 5;
  }

  if (resume.certifications && resume.certifications.length > 0 && resume.certifications[0].certificateName) {
    score += 5;
  }

  return score;
};

// @desc    Get all resumes of user
// @route   GET /api/resumes
// @access  Private
export const getResumes = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected. Fetching resumes from In-Memory fallback.');
      return res.json(inMemoryResumes);
    }
    const resumes = await Resume.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
export const getResumeById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected. Fetching resume from In-Memory fallback.');
      const resume = inMemoryResumes.find(r => r._id === req.params.id);
      if (!resume) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      return res.json(resume);
    }
    
    const resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json(resume);
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new resume
// @route   POST /api/resumes
// @access  Private
export const createResume = async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      userId: req.user?.id || 'guest_id'
    };

    resumeData.completionPercentage = calculateCompletion(resumeData);

    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected. Creating resume in In-Memory fallback.');
      const newResume = {
        ...resumeData,
        _id: 'mem_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryResumes.unshift(newResume);
      return res.status(201).json(newResume);
    }

    const resume = await Resume.create(resumeData);
    res.status(201).json(resume);
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(400).json({ message: error.message || 'Invalid resume data' });
  }
};

// @desc    Update a resume
// @route   PUT /api/resumes/:id
// @access  Private
export const updateResume = async (req, res) => {
  try {
    const updatedData = { ...req.body };
    updatedData.completionPercentage = calculateCompletion(updatedData);

    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected. Updating resume in In-Memory fallback.');
      const idx = inMemoryResumes.findIndex(r => r._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      const updatedResume = {
        ...inMemoryResumes[idx],
        ...updatedData,
        updatedAt: new Date()
      };
      inMemoryResumes[idx] = updatedResume;
      return res.json(updatedResume);
    }

    let resume = await Resume.findOne({ _id: req.params.id, userId: req.user.id });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true, runValidators: true }
    );

    res.json(resume);
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/resumes/:id
// @access  Private
export const deleteResume = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected. Deleting resume from In-Memory fallback.');
      const idx = inMemoryResumes.findIndex(r => r._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      inMemoryResumes.splice(idx, 1);
      return res.json({ message: 'Resume removed successfully' });
    }

    const resume = await Resume.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.json({ message: 'Resume removed successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
