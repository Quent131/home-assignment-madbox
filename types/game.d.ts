export type Game = {
  id: string;
  currentWordId: number;
  points: number;
  totalTries: number;
};

export type Leaderboard = {
  id: number;
  player: string;
  score: number;
  createdAt: string;
};
