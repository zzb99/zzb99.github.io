import settings from './workbench.json';

type ProfileOverrides = Partial<{
  name: string; siteName: string; brandName: string; url: string; email: string; affiliation: string; major: string; graduation: string; sameAs: string[]; description: string; knowsAbout: string[];
}>;

export interface SourceLink {
  label: string;
  href: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface NationalAward {
  id: string;
  title: string;
  level: string;
  year: string;
  note: string;
  sources: SourceLink[];
}

export interface ProvincialAward {
  id: string;
  title: string;
  level: string;
  year: string;
  note?: string;
  sources?: SourceLink[];
}

export interface IntellectualPropertyRecord {
  id: string;
  title: string;
  identifier: string;
  type: string;
  project: string;
}

export interface AchievementSummaryItem {
  href: string;
  label: string;
  value: string;
  copy: string;
}

type RecordOverrides = Partial<{
  faqItems: FaqItem[];
  nationalAwards: NationalAward[];
  provincialAwards: ProvincialAward[];
  intellectualProperty: IntellectualPropertyRecord[];
  achievementSummary: AchievementSummaryItem[];
}>;

export const workbenchSettings = settings as typeof settings & { profile: ProfileOverrides; records: RecordOverrides };
export const homeConfig = settings.home;

export const profileOverrides = workbenchSettings.profile;
export const recordOverrides = workbenchSettings.records;
