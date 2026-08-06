import settings from './workbench.json';

type ProfileOverrides = Partial<{
  name: string; siteName: string; brandName: string; url: string; email: string; affiliation: string; major: string; graduation: string; sameAs: string[]; description: string; knowsAbout: string[];
}>;

type RecordOverrides = Partial<{
  faqItems: Array<{ question: string; answer: string }>;
  nationalAwards: Array<Record<string, unknown>>;
  provincialAwards: Array<Record<string, unknown>>;
  intellectualProperty: Array<Record<string, unknown>>;
  achievementSummary: Array<{ href: string; label: string; value: string; copy: string }>;
}>;

export const workbenchSettings = settings as typeof settings & { profile: ProfileOverrides; records: RecordOverrides };
export const homeConfig = settings.home;

export const profileOverrides = workbenchSettings.profile;
export const recordOverrides = workbenchSettings.records;
