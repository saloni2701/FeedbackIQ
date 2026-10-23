export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Severity = 'Critical' | 'Major' | 'Moderate' | 'Minor';
export type Recency = 'Rising' | 'Stable' | 'Declining';

export interface FeedbackItem {
  id: number;
  text: string;
  source: string;
  date: string;
  sentiment: Sentiment;
  aspect: string;
}

export interface Issue {
  id: number;
  title: string;
  aspect: string;
  mentions: number;
  severity: Severity;
  recency: Recency;
  /** 0-100, derived from frequency, severity and recency */
  priority: number;
}

export interface FeatureRequest {
  id: number;
  title: string;
  count: number;
  theme: string;
}

export interface AspectSentiment {
  aspect: string;
  mentions: number;
  positive: number;
  neutral: number;
  negative: number;
}

export interface TrendPoint {
  week: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface Topic {
  name: string;
  count: number;
  keywords: string[];
}

export interface Summary {
  total: number;
  totalChange: number;
  netSentiment: number;
  openIssues: number;
  highPriority: number;
  requests: number;
  requestThemes: number;
  headline: string;
  recommendations: string[];
}
