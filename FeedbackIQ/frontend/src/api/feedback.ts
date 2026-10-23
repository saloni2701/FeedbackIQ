import { http } from './client';
import {
  mockAspects, mockFeedback, mockIssues, mockRequests, mockSummary, mockTopics, mockTrends,
} from '../data/mock';
import type { AspectSentiment, FeatureRequest, FeedbackItem, Issue, Summary, Topic, TrendPoint } from '../types';

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

async function get<T>(path: string, fallback: T): Promise<T> {
  if (useMock) {
    await new Promise((r) => setTimeout(r, 250));
    return fallback;
  }
  const res = await http.get<T>(path);
  return res.data;
}

// Endpoint paths are placeholders: align them with your FastAPI routes.
export const getSummary = () => get<Summary>('/api/summary', mockSummary);
export const getTrends = () => get<TrendPoint[]>('/api/trends', mockTrends);
export const getAspects = () => get<AspectSentiment[]>('/api/aspects', mockAspects);
export const getIssues = () => get<Issue[]>('/api/issues', mockIssues);
export const getRequests = () => get<FeatureRequest[]>('/api/feature-requests', mockRequests);
export const getTopics = () => get<Topic[]>('/api/topics', mockTopics);
export const getFeedback = () => get<FeedbackItem[]>('/api/feedback', mockFeedback);
