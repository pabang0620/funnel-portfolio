export interface Project {
  key: string // matches route folder name, e.g. 'utm-builder'
  name: string // display name, e.g. 'UTM Builder'
  path: string // real route, e.g. '/utm-builder'
  description: string // one-line card description
  tag: string // single category chip
}

export const PROJECTS: Project[] = [
  {
    key: 'utm-builder',
    name: 'UTM Builder',
    path: '/utm-builder',
    description:
      'Generates the ad-tracking keys used across Ad Content Storage. Standardizes UTM parameters by channel, campaign, and creative for consistent data collection.',
    tag: 'Marketing',
  },
  {
    key: 'hr-hub',
    name: 'HR Hub',
    path: '/hr-hub',
    description: 'Org-chart and employee-directory dashboard for internal HR management.',
    tag: 'Internal',
  },
  {
    key: 'ad-content-storage',
    name: 'Ad Content Storage',
    path: '/ad-content-storage',
    description:
      'Asset library for storing and organizing e-commerce marketing creative. Keeps a large volume of ad assets categorized, with per-channel performance visible alongside each one.',
    tag: 'AI',
  },
  {
    key: 'edu-platform',
    name: 'Edu Platform',
    path: '/edu-platform',
    description:
      'Training platform that unifies AI, marketing, and internal course content — course progress tracking and material distribution in one place.',
    tag: 'Education',
  },
  {
    key: 'cs-manager',
    name: 'CS Manager',
    path: '/cs-manager',
    description:
      'Support platform for storing and managing call-center transcripts, with chatbot handoff built in for coverage outside business hours.',
    tag: 'Support',
  },
  {
    key: 'ad-library-scraper',
    name: 'Ad Library Scraper',
    path: '/ad-library-scraper',
    description:
      'Collects and stores competitor ad creative, sorted into reference sets so the team can pull them up directly in meetings.',
    tag: 'Data',
  },
  {
    key: 'meeting-room',
    name: 'Meeting Room',
    path: '/meeting-room',
    description: 'Real-time meeting-room booking system for the office, with Slack notifications for new reservations.',
    tag: 'Internal',
  },
  {
    key: 'file-hub',
    name: 'File Hub',
    path: '/file-hub',
    description:
      'Internal file storage for uploading, organizing, and sharing company files — folder structure and drag-and-drop, Google-Drive-style.',
    tag: 'Infra',
  },
  {
    key: 'ad-performance',
    name: 'Ad Performance',
    path: '/ad-performance',
    description: 'Ad-performance dashboard for e-commerce products — ad spend, revenue, and profit by channel in one view, to support marketing decisions.',
    tag: 'Analytics',
  },
  {
    key: 'med-manager',
    name: 'Med Manager',
    path: '/med-manager',
    description:
      'Operations platform for a hospital ad agency — lead data from incoming ads, performance reporting, ad-spend adjustment, and TM (phone-sales) call tracking in one system.',
    tag: 'Ops',
  },
]
