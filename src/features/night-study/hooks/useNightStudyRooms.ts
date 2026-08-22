import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { nightStudyApi } from "@entities/night-study/api";
import { nightStudyQueryKeys } from "@entities/night-study/api/queryKeys";
import type { NightStudyRoom } from "@entities/night-study/types";

const fetchRooms = async (): Promise<NightStudyRoom[]> => {
  try {
    const { data } = await nightStudyApi.getRooms();
    return data.data ?? [];
  } catch (error) {
    // 랩실 조회에 실패해도 신청 자체는 막지 않는다. 희망 랩실은 선택 항목이다.
    if (axios.isAxiosError(error)) return [];
    throw error;
  }
};

export const useNightStudyRooms = () => {
  const { data, isPending } = useQuery({
    queryKey: nightStudyQueryKeys.rooms,
    queryFn: fetchRooms,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { rooms: data ?? [], loading: isPending };
};
