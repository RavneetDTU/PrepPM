export interface Profile {
  id: string;
  fullName: string;
  currentRole: string;
  targetCompanies: string[];
  targetLevel: string;
  interviewDate: string;
  streakCount: number;
  lastActiveDate: string | null;
  subscriptionTier: 'free' | 'pro';
  createdAt: string;
}

export interface Question {
  id: string;
  company: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string;
  frameworkHint: string;
  rubricItems: string[];
  goldAnswer: string;
  solutionDocUrl?: string;
  tags?: string[];
  source?: string;
  upvotes: number;
  createdAt?: any;
}

export interface Session {
  id: string;
  userId: string;
  company: string;
  questionType: string;
  mode: 'voice' | 'text';
  questionCount: number;
  overallScore: number;
  scores: Record<string, number>;
  transcript: QuestionFeedback[];
  createdAt: string;
}

export interface QuestionFeedback {
  questionId: string;
  questionText: string;
  answer: string;
  score: number;
  feedback: {
    good: string[];
    improve: string[];
    missing: string[];
    summary: string;
    dimension_scores: Record<string, number>;
  };
}

export interface SkillScore {
  userId: string;
  category: string;
  score: number;
  updatedAt: string;
}
