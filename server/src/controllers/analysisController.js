import mongoose from 'mongoose';
import { extractTextFromBuffer } from '../utils/parser.js';
import {
  analyzeResumeText,
  analyzeJobMatch,
  generateCoverLetter,
  generateAISummary
} from '../utils/ai.js';
import AnalysisHistory from '../models/AnalysisHistory.js';

// In-Memory fallback storage when MongoDB is disconnected
let inMemoryAnalyses = [];

// @desc    Upload and Analyze Resume
// @route   POST /api/analysis/analyze
// @access  Private
export const analyzeResume = async (req, res) => {
  try {
    let resumeText = '';
    let fileName = 'Pasted Text';

    if (req.file) {
      fileName = req.file.originalname;
      resumeText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype, req.file.originalname);
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else {
      return res.status(400).json({ message: 'Please upload a resume file or provide resume text' });
    }

    if (!resumeText.trim()) {
      return res.status(400).json({ message: 'The uploaded file or text is empty.' });
    }

    // 1. Run core ATS analysis
    const analysis = await analyzeResumeText(resumeText);

    // 2. Run Job Match if description is provided
    const jobDescription = req.body.jobDescription;
    let jobMatchResult = null;

    if (jobDescription && jobDescription.trim()) {
      const match = await analyzeJobMatch(resumeText, jobDescription);
      jobMatchResult = {
        score: match.score,
        jobDescription,
        matchedKeywords: match.matchedKeywords,
        missingKeywords: match.missingKeywords,
        recommendedKeywords: match.recommendedKeywords,
        experienceFeedback: match.experienceFeedback
      };
    }

    // Prepare history payload
    const historyData = {
      userId: req.user?.id || 'guest_id',
      fileName,
      atsScore: analysis.atsScore,
      parsedData: {
        name: analysis.parsedData?.name || '',
        email: analysis.parsedData?.email || '',
        phone: analysis.parsedData?.phone || '',
        skills: analysis.parsedData?.skills || [],
        education: analysis.parsedData?.education || [],
        experience: analysis.parsedData?.experience || [],
        projects: analysis.parsedData?.projects || [],
        achievements: analysis.parsedData?.achievements || []
      },
      layoutEvaluation: {
        pages: analysis.layoutEvaluation?.pages,
        whitespace: analysis.layoutEvaluation?.whitespace,
        margins: analysis.layoutEvaluation?.margins,
        sectionOrder: analysis.layoutEvaluation?.sectionOrder,
        feedback: analysis.layoutEvaluation?.feedback,
        score: analysis.layoutEvaluation?.score
      },
      jobMatch: jobMatchResult,
      contentPerformance: {
        actionVerbsScore: analysis.contentPerformance?.actionVerbsScore,
        actionVerbsFeedback: analysis.contentPerformance?.actionVerbsFeedback,
        metricsScore: analysis.contentPerformance?.metricsScore,
        metricsFeedback: analysis.contentPerformance?.metricsFeedback,
        grammarScore: analysis.contentPerformance?.grammarScore,
        grammarFeedback: analysis.contentPerformance?.grammarFeedback
      },
      aiSuggestions: {
        summary: analysis.aiSuggestions?.summary,
        skills: analysis.aiSuggestions?.skills,
        projects: analysis.aiSuggestions?.projects,
        experience: analysis.aiSuggestions?.experience,
        achievements: analysis.aiSuggestions?.achievements
      },
      nextSteps: analysis.nextSteps,
      rawResumeText: resumeText
    };

    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected. Saving analysis in In-Memory fallback.');
      const newAnalysis = {
        ...historyData,
        _id: 'an_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryAnalyses.unshift(newAnalysis);
      return res.status(201).json(newAnalysis);
    }

    const historyEntry = await AnalysisHistory.create(historyData);
    res.status(201).json(historyEntry);
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: error.message || 'Error occurred during AI analysis' });
  }
};

// @desc    Get all analysis history for user
// @route   GET /api/analysis/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected. Fetching analysis history from In-Memory fallback.');
      return res.json(inMemoryAnalyses);
    }
    const history = await AnalysisHistory.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single analysis record
// @route   GET /api/analysis/history/:id
// @access  Private
export const getAnalysisById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected. Fetching analysis record from In-Memory fallback.');
      const record = inMemoryAnalyses.find(a => a._id === req.params.id);
      if (!record) {
        return res.status(404).json({ message: 'Analysis record not found' });
      }
      return res.json(record);
    }
    const record = await AnalysisHistory.findOne({ _id: req.params.id, userId: req.user.id });
    if (!record) {
      return res.status(404).json({ message: 'Analysis record not found' });
    }
    res.json(record);
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete analysis history record
// @route   DELETE /api/analysis/history/:id
// @access  Private
export const deleteAnalysis = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('MongoDB not connected. Deleting analysis record from In-Memory fallback.');
      const idx = inMemoryAnalyses.findIndex(a => a._id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ message: 'Analysis record not found' });
      }
      inMemoryAnalyses.splice(idx, 1);
      return res.json({ message: 'Analysis record removed successfully' });
    }

    const record = await AnalysisHistory.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!record) {
      return res.status(404).json({ message: 'Analysis record not found' });
    }
    res.json({ message: 'Analysis record removed successfully' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate Cover Letter from analysis
// @route   POST /api/analysis/cover-letter
// @access  Private
export const generateCoverLetterForAnalysis = async (req, res) => {
  const { analysisId, resumeText, companyName, role, hiringManager } = req.body;

  try {
    let sourceText = resumeText;

    if (analysisId) {
      if (mongoose.connection.readyState !== 1) {
        const record = inMemoryAnalyses.find(a => a._id === analysisId);
        if (record) sourceText = record.rawResumeText;
      } else {
        const record = await AnalysisHistory.findOne({ _id: analysisId, userId: req.user.id });
        if (record) sourceText = record.rawResumeText;
      }
    }

    if (!sourceText) {
      return res.status(400).json({ message: 'No resume text available to generate cover letter.' });
    }

    if (!companyName || !role) {
      return res.status(400).json({ message: 'Company Name and Role are required.' });
    }

    const coverLetter = await generateCoverLetter(sourceText, companyName, role, hiringManager);
    
    // Save to the corresponding analysis record if exists
    if (analysisId) {
      if (mongoose.connection.readyState !== 1) {
        const idx = inMemoryAnalyses.findIndex(a => a._id === analysisId);
        if (idx !== -1) {
          inMemoryAnalyses[idx].coverLetter = {
            companyName,
            role,
            content: coverLetter.content
          };
        }
      } else {
        await AnalysisHistory.findByIdAndUpdate(analysisId, {
          coverLetter: {
            companyName,
            role,
            content: coverLetter.content
          }
        });
      }
    }

    res.json(coverLetter);
  } catch (error) {
    console.error('Cover letter generate error:', error);
    res.status(500).json({ message: error.message || 'Error generating cover letter' });
  }
};

// @desc    Generate summary from resume data (used in designer)
// @route   POST /api/analysis/generate-summary
// @access  Private
export const generateSummaryFromResumeData = async (req, res) => {
  try {
    const { resumeData } = req.body;
    if (!resumeData) {
      return res.status(400).json({ message: 'Resume data is required' });
    }
    const result = await generateAISummary(resumeData);
    res.json(result);
  } catch (error) {
    console.error('AI summary error:', error);
    res.status(500).json({ message: error.message || 'Error generating professional summary' });
  }
};
