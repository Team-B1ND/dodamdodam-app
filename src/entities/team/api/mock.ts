import type { Team } from "@entities/team/types";

// 서버 API가 준비되기 전까지 화면 확인용으로 쓰는 임시 데이터.
// entities/team/api/index.ts의 teamApi가 준비되면 지워도 된다.
export const MOCK_ALL_TEAMS: Team[] = [
  {
    id: "1",
    name: "B1ND",
    introduction: "코딩을 좋아하는 우리 바인드팀",
    profileImage: null,
    memberCount: 4,
    createdAt: "2026-03-01T00:00:00",
  },
  {
    id: "2",
    name: "DGIT",
    introduction: "디자인 동아리",
    profileImage: null,
    memberCount: 6,
    createdAt: "2026-03-02T00:00:00",
  },
  {
    id: "3",
    name: "알고리즘 스터디",
    introduction: "매주 화요일에 모여요",
    profileImage: null,
    memberCount: 5,
    createdAt: "2026-03-03T00:00:00",
  },
];

export const MOCK_MY_TEAMS: Team[] = MOCK_ALL_TEAMS.slice(0, 1);
