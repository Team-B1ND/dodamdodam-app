import { useState, useCallback } from "react";
import type { TimeSlot } from "../form/TimeSlotPicker";

export interface StudentMember {
  id: string;
  name: string;
  grade: number;
  room: number;
  number: number;
  profileImage?: string | null;
  isSelf?: boolean;
}

export interface SelectedNightStudyTeam {
  id: string;
  name: string;
  members: StudentMember[];
}

export const useNightStudyForm = () => {
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("NIGHT1");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  // 개인
  const [reason, setReason] = useState("");
  const [usePhone, setUsePhone] = useState(false);
  const [phoneReason, setPhoneReason] = useState("");
  const togglePhone = useCallback(() => setUsePhone((prev) => !prev), []);

  // 프로젝트
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [members, setMembers] = useState<StudentMember[]>([]);
  const [teams, setTeams] = useState<SelectedNightStudyTeam[]>([]);

  const addMember = useCallback((member: StudentMember) => {
    setMembers((prev) => {
      if (prev.some((m) => m.id === member.id)) return prev;
      return [...prev, member];
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addTeam = useCallback((team: SelectedNightStudyTeam) => {
    setTeams((prev) => {
      const withoutTeam = prev.filter((item) => item.id !== team.id);
      return [...withoutTeam, team];
    });
  }, []);

  const removeTeam = useCallback((id: string) => {
    setTeams((prev) => prev.filter((team) => team.id !== id));
  }, []);

  const removeTeamMember = useCallback((teamId: string, memberId: string) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId
          ? {
              ...team,
              members: team.members.filter((member) => member.id !== memberId),
            }
          : team,
      ),
    );
  }, []);

  return {
    common: { timeSlot, setTimeSlot, startDate, setStartDate, endDate, setEndDate },
    personal: { reason, setReason, usePhone, togglePhone, phoneReason, setPhoneReason },
    project: {
      projectName, setProjectName,
      projectDescription, setProjectDescription,
      members, addMember, removeMember,
      teams, addTeam, removeTeam, removeTeamMember,
    },
  };
};
