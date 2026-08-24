export interface InApp {
  appId: string;
  name: string;
  subtitle: string;
  description: string;
  iconUrl: string;
  darkIconUrl: string | null;
  appUrl: string;
}

export interface InAppPageResponse {
  content: InApp[];
  hasNext: boolean;
}

export interface InAppDetail {
  appId: string;
  teamId: string;
  name: string;
  subtitle: string;
  description: string | null;
  iconUrl: string;
  darkIconUrl: string | null;
  inquiryMail: string;
  active: boolean;
}

export interface InAppTeam {
  teamId: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  githubUrl: string | null;
  isOwner: boolean;
}
