import { Word } from "@madbox-assignment/types";
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
};
