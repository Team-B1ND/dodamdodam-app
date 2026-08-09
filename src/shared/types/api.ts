export interface ApiResponse<T = undefined> {
  status: number;
  message: string;
  data: T;
}

export interface ApiError {
  status: number;
  message: string;
  code: string;
}

export interface InfinityScrollResponse<T> {
  content: T[];
  hasNext: boolean;
}
