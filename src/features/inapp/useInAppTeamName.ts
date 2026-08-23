import { useQuery } from "@tanstack/react-query";
import { inappApi } from "@entities/inapp/api";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";

// 활성 앱 목록(/inapp/app/active) 응답에는 팀 정보가 없다.
// 앱 상세로 teamId를 얻은 뒤 팀을 조회해 이름을 가져온다. 웹 관리 페이지와 같은 방식이다.
const fetchTeamName = async (appId: string): Promise<string | null> => {
  const { data: appRes } = await inappApi.getApp(appId);
  const teamId = appRes.data?.teamId;
  if (!teamId) return null;

  const { data: teamRes } = await inappApi.getTeam(teamId);
  return teamRes.data?.name ?? null;
};

export const useInAppTeamName = (appId: string) => {
  const { data } = useQuery({
    queryKey: inappQueryKeys.teamName(appId),
    queryFn: () => fetchTeamName(appId),
    // 팀명은 자주 바뀌지 않아 한 번 받아두면 재진입 시 즉시 표시된다.
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  return data ?? null;
};
