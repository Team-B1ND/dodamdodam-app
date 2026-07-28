import type { Team, TeamDetail } from "@entities/team/types";

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

export const MOCK_TEAM_DETAILS: Record<string, TeamDetail> = {
  "1": {
    ...MOCK_ALL_TEAMS[0],
    members: [
      { publicId: "p1", name: "정대원", profileImage: null, grade: 2, room: 4, number: 1, role: "LEADER" },
      { publicId: "p2", name: "전승호", profileImage: null, grade: 2, room: 4, number: 2, role: "MEMBER" },
      { publicId: "p3", name: "박준석", profileImage: null, grade: 2, room: 2, number: 1, role: "MEMBER" },
      { publicId: "p4", name: "이우진", profileImage: null, grade: 2, room: 3, number: 1, role: "MEMBER" },
    ],
  },
  "2": {
    ...MOCK_ALL_TEAMS[1],
    members: [
      { publicId: "p5", name: "김민규", profileImage: null, grade: 2, room: 2, number: 1, role: "LEADER" },
      { publicId: "p6", name: "박현준", profileImage: null, grade: 2, room: 1, number: 1, role: "MEMBER" },
    ],
  },
  "3": {
    ...MOCK_ALL_TEAMS[2],
    members: [
      { publicId: "p7", name: "이현석", profileImage: null, grade: 1, room: 1, number: 1, role: "LEADER" },
    ],
  },
};
