export const teamQueryKeys = {
  all: ["team", "all"] as const,
  my: ["team", "my"] as const,
  invite: ["team", "invite"] as const,
  detail: (teamId: string) => ["team", "detail", teamId] as const,
};
