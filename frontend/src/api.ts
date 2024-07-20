import { Leaderboard, Word } from "@madbox-assignment/types";
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:3333/api" });

export const apiService = {
  getWord: async () => {
    const { data } = await api.get<Word>("/word");
    return data;
  },

  getWordById: async (id: number) => {
    const { data } = await api.get<Word>(`/word/${id}`);
    return data;
  },

  submitLeaderboard: async ({
    name,
    score,
  }: {
    name: string;
    score: number;
  }) => {
    const { data } = await api.post<Leaderboard[]>("/leaderboard", {
      name,
      score,
    });
    return data;
  },

  getLeaderboard: async () => {
    const { data } = await api.get<Leaderboard[]>("/leaderboard");
    return data;
  },
};
