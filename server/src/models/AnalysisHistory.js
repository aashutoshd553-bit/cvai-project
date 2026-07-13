import mongoose from 'mongoose';

const layoutEvaluationSchema = new mongoose.Schema({
  pages: { type: Number },
  whitespace: { type: String },
  margins: { type: String },
  sectionOrder: { type: String },
  feedback: [{ type: String }],
  score: { type: Number, default: 0 }
});

const jobMatchSchema = new mongoose.Schema({
  score: { type: Number, default: 0 },
  jobDescription: { type: String },
  matchedKeywords: [{ type: String }],
  missingKeywords: [{ type: String }],
  recommendedKeywords: [{ type: String }],
  experienceFeedback: { type: String }
});

const contentPerformanceSchema = new mongoose.Schema({
  actionVerbsScore: { type: Number, default: 0 },
  actionVerbsFeedback: [{ type: String }],
  metricsScore: { type: Number, default: 0 },
  metricsFeedback: [{ type: String }],
  grammarScore: { type: Number, default: 0 },
  grammarFeedback: [{ type: String }]
});

const aiSuggestionsSchema = new mongoose.Schema({
  summary: { type: String },
  skills: { type: String },
  projects: { type: String },
  experience: { type: String },
  achievements: { type: String }
});

const coverLetterSchema = new mongoose.Schema({
  companyName: { type: String },
  role: { type: String },
  content: { type: String }
});

const analysisHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  atsScore: {
    type: Number,
    required: true
  },
  layoutEvaluation: layoutEvaluationSchema,
  jobMatch: jobMatchSchema,
  contentPerformance: contentPerformanceSchema,
  aiSuggestions: aiSuggestionsSchema,
  coverLetter: coverLetterSchema,
  nextSteps: [{ type: String }],
  rawResumeText: { type: String }
}, {
  timestamps: true
});

const AnalysisHistory = mongoose.model('AnalysisHistory', analysisHistorySchema);
export default AnalysisHistory;
