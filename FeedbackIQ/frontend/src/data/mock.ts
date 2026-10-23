import type { AspectSentiment, FeatureRequest, FeedbackItem, Issue, Summary, Topic, TrendPoint } from '../types';

export const mockSummary: Summary = {
  total: 12480,
  totalChange: 6.2,
  netSentiment: 0.34,
  openIssues: 47,
  highPriority: 9,
  requests: 132,
  requestThemes: 18,
  headline:
    'Most customers are happy with the interface, but slow performance and payment problems are the biggest complaints this period. Start with these two.',
  recommendations: [
    'Check the most recent release for the slowdown, since complaints have grown for three weeks.',
    'Fix the payment retry error. It affects fewer people but is the most serious.',
    'Plan offline mode, the most requested idea.',
  ],
};

export const mockTrends: TrendPoint[] = [
  { week: 'W1', positive: 58, neutral: 17, negative: 25 },
  { week: 'W2', positive: 60, neutral: 16, negative: 24 },
  { week: 'W3', positive: 59, neutral: 16, negative: 25 },
  { week: 'W4', positive: 62, neutral: 16, negative: 22 },
  { week: 'W5', positive: 63, neutral: 14, negative: 23 },
  { week: 'W6', positive: 64, neutral: 13, negative: 23 },
  { week: 'W7', positive: 66, neutral: 12, negative: 22 },
];

export const mockAspects: AspectSentiment[] = [
  { aspect: 'Speed and performance', mentions: 1920, positive: 44, neutral: 16, negative: 40 },
  { aspect: 'Ease of use', mentions: 1610, positive: 68, neutral: 18, negative: 14 },
  { aspect: 'Price and value', mentions: 1205, positive: 36, neutral: 24, negative: 40 },
  { aspect: 'Customer support', mentions: 980, positive: 55, neutral: 15, negative: 30 },
];

export const mockIssues: Issue[] = [
  { id: 1, title: 'App slows down after the latest update', aspect: 'Performance', mentions: 312, severity: 'Major', recency: 'Rising', priority: 92 },
  { id: 2, title: 'Payment fails when retrying', aspect: 'Billing', mentions: 188, severity: 'Critical', recency: 'Stable', priority: 84 },
  { id: 3, title: 'Support replies take too long', aspect: 'Support', mentions: 241, severity: 'Moderate', recency: 'Stable', priority: 61 },
  { id: 4, title: 'Search results feel irrelevant', aspect: 'Ease of use', mentions: 133, severity: 'Moderate', recency: 'Rising', priority: 54 },
  { id: 5, title: 'Menu is hard to find', aspect: 'Ease of use', mentions: 97, severity: 'Minor', recency: 'Declining', priority: 28 },
];

export const mockRequests: FeatureRequest[] = [
  { id: 1, title: 'Work offline', count: 74, theme: 'Availability' },
  { id: 2, title: 'Save reports as PDF', count: 58, theme: 'Reporting' },
  { id: 3, title: 'Dark mode', count: 41, theme: 'Appearance' },
  { id: 4, title: 'Share dashboards with a link', count: 36, theme: 'Collaboration' },
  { id: 5, title: 'Email alerts for new problems', count: 29, theme: 'Notifications' },
];

export const mockTopics: Topic[] = [
  { name: 'Speed and loading', count: 1840, keywords: ['slow', 'loading', 'lag', 'update'] },
  { name: 'Billing and payments', count: 1320, keywords: ['payment', 'refund', 'charge', 'retry'] },
  { name: 'Design and layout', count: 1105, keywords: ['clean', 'menu', 'layout', 'easy'] },
  { name: 'Support experience', count: 960, keywords: ['reply', 'agent', 'wait', 'helpful'] },
  { name: 'Reports and export', count: 640, keywords: ['pdf', 'export', 'download', 'report'] },
  { name: 'Account and login', count: 510, keywords: ['password', 'login', 'verify', 'email'] },
];

export const mockFeedback: FeedbackItem[] = [
  { id: 1, text: 'Loved the new layout, much easier to find things.', source: 'Review', date: '2026-10-20', sentiment: 'positive', aspect: 'Ease of use' },
  { id: 2, text: 'Everything has become very slow since the last update.', source: 'Support ticket', date: '2026-10-20', sentiment: 'negative', aspect: 'Performance' },
  { id: 3, text: 'My card was charged twice and retrying the payment failed.', source: 'Survey', date: '2026-10-19', sentiment: 'negative', aspect: 'Billing' },
  { id: 4, text: 'Support was helpful and answered within the hour.', source: 'Review', date: '2026-10-19', sentiment: 'positive', aspect: 'Support' },
  { id: 5, text: 'Would be great to use the app without internet.', source: 'Feedback form', date: '2026-10-18', sentiment: 'neutral', aspect: 'Availability' },
  { id: 6, text: 'The price is fair for what you get.', source: 'Survey', date: '2026-10-18', sentiment: 'positive', aspect: 'Price and value' },
  { id: 7, text: 'Please add a way to download reports as PDF.', source: 'Feedback form', date: '2026-10-17', sentiment: 'neutral', aspect: 'Reporting' },
  { id: 8, text: 'Waited three days for a reply to a simple question.', source: 'Support ticket', date: '2026-10-16', sentiment: 'negative', aspect: 'Support' },
];
