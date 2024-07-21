import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "./api";
import {
  ActionIcon,
  Alert,
  Button,
  Loader,
  Modal,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { BarChartIcon, QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { useDisclosure, useFocusTrap } from "@mantine/hooks";
import { v4 as uuidv4 } from "uuid";
import { Game, Leaderboard } from "@madbox-assignment/types";
import { useEffect, useMemo, useState } from "react";

const LOCAL_STORAGE_KEY = "game-player-data";

const setLocalStorage = (data: Game) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

function App() {
  const [answer, setAnswer] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerNameError, setPlayerNameError] = useState(false);
  const [lastRoundResult, setLastRoundResult] = useState<
    "success" | "error" | undefined
  >();

  const localStorageData = localStorage.getItem(LOCAL_STORAGE_KEY);
  const playerData: Game = useMemo(
    () =>
      localStorageData
        ? JSON.parse(localStorageData)
        : {
            id: uuidv4(),
            points: 10,
            totalTries: 0,
            currentWordId: 0,
          },
    [localStorageData]
  );

  setLocalStorage(playerData);

  const { data, isFetching } = useQuery({
    queryKey: ["word"],
    queryFn: () => {
      if (playerData.currentWordId === 0) return apiService.getWord();
      return apiService.getWordById(playerData.currentWordId);
    },
    staleTime: 60000,
  });
  const { data: leaderboardData } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: apiService.getLeaderboard,
    staleTime: 60000,
  });

  const { mutate } = useMutation({
    mutationFn: apiService.submitLeaderboard,
    onSuccess: (data) => {
      queryClient.setQueryData(["leaderboard"], data);
    },
  });

  useEffect(() => {
    if (data) {
      playerData.currentWordId = data.id;
      setLocalStorage(playerData);
    }
  }, [data, playerData]);

  const [opened, { open, close }] = useDisclosure();
  const [
    victoryModalOpened,
    { open: openVictoryModal, close: closeVictoryModal },
  ] = useDisclosure();
  const [
    defeatModalOpened,
    { open: openDefeatModal, close: closeDefeatModal },
  ] = useDisclosure();
  const [
    leaderboardModalOpened,
    { open: openLeaderboardModal, close: closeLeaderboardModal },
  ] = useDisclosure();

  const focusTrapRef = useFocusTrap();

  const queryClient = useQueryClient();
  const handleGuess = () => {
    if (data?.english === answer) {
      playerData.points += 1;
      setLastRoundResult("success");
    } else {
      playerData.points -= 1;
      setLastRoundResult("error");
    }

    if (playerData.points === 20) {
      openVictoryModal();
    } else if (playerData.points === 0) {
      openDefeatModal();
    }

    playerData.currentWordId = 0;
    playerData.totalTries += 1;
    setLocalStorage(playerData);
    setAnswer("");
    queryClient.invalidateQueries({ queryKey: ["word"] });
  };

  const handleCloseResultModal = (closeModalFunction: () => void) => {
    playerData.points = 10;
    playerData.currentWordId = 0;
    playerData.totalTries = 0;
    setLocalStorage(playerData);
    setLastRoundResult(undefined);
    setPlayerName("");
    closeModalFunction();
  };

  const handleSubmitLeaderboard = () => {
    if (playerName.length === 0) {
      setPlayerNameError(true);
      return;
    }
    mutate({ name: playerName, score: playerData.totalTries });
    handleCloseResultModal(closeVictoryModal);
    openLeaderboardModal();
  };

  return data && leaderboardData ? (
    <div className="p-8 justify-center">
      <Modal opened={opened} onClose={close} title="About Translatle" centered>
        Translatle is a simple application that displays a random French verb
        which you have to translate. As additionnal hints, we also provide the
        translation first letter and the number of letters. <br />
        When you guess the translation you get one point, but you lose one point
        if your guess is not correct. <br />
        You begin with 10 points. If you reach 0 points, the game is over. If
        you reach 20, you win.
        <br />
        <p className="text-center pt-4">Good luck!</p>
      </Modal>
      <Modal
        opened={victoryModalOpened}
        onClose={() => handleCloseResultModal(closeVictoryModal)}
        centered
        title="Congratulations !"
      >
        <p className="pb-4">
          Good job ! You defeated Translatle. <br />
          It took you <b>{playerData.totalTries} tries</b>. <br /> <br />
          If you want to leave your mark, you can share your name with us so
          that we can enter it in the leaderboard.
        </p>
        <div className="flex justify-between">
          <TextInput
            value={playerName}
            onChange={(event) => {
              setPlayerName(event.currentTarget.value);
              setPlayerNameError(false);
            }}
            error={playerNameError}
          />
          <Button onClick={handleSubmitLeaderboard}>Submit</Button>
        </div>
      </Modal>
      <Modal
        opened={defeatModalOpened}
        onClose={() => handleCloseResultModal(closeDefeatModal)}
        centered
        title="Bad luck !"
      >
        <p>
          Sorry, you ran out of points. <br />
          You made <b>{playerData.totalTries} tries</b>. <br />
          Better luck next time !
        </p>
      </Modal>
      <Modal
        opened={leaderboardModalOpened}
        onClose={closeLeaderboardModal}
        centered
        title="Leaderboard"
      >
        <LeaderboardTable data={leaderboardData} />
      </Modal>
      <div className="flex flex-col gap-5">
        <Title order={1} className="text-center">
          Translatle
        </Title>
        <div className="flex items-center gap-2 justify-center">
          <p>Welcome to Translatle.</p>
          <ActionIcon onClick={open} variant="subtle" color="white">
            <QuestionMarkCircledIcon />
          </ActionIcon>
          <ActionIcon
            onClick={openLeaderboardModal}
            variant="subtle"
            color="white"
          >
            <BarChartIcon />
          </ActionIcon>
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-center">Your score : {playerData.points}</p>
          {lastRoundResult &&
            (lastRoundResult === "success" ? (
              <Alert className="text-center" color="green">
                Correct!
              </Alert>
            ) : (
              <Alert className="text-center" color="red">
                Incorrect!
              </Alert>
            ))}
          {isFetching ? (
            <Loader />
          ) : (
            <>
              <p>French verb : {data?.french}</p>
              <div className="flex justify-center gap-2">
                <p className="capitalize text-2xl">{data?.firstLetter}</p>
                {data.english
                  .slice(1)
                  .split("")
                  .map((_, ind) => (
                    <Letter key={`letter_${ind}`} />
                  ))}
              </div>
              <TextInput
                value={answer}
                onChange={(event) => setAnswer(event.currentTarget.value)}
                classNames={{
                  input: "w-1/2 text-center text-xl",
                  wrapper: "flex justify-center",
                }}
                onKeyUp={(event) => {
                  if (event.key === "Enter") handleGuess();
                }}
                ref={focusTrapRef}
              />
            </>
          )}
        </div>
      </div>
    </div>
  ) : null;
}

const Letter = () => {
  return <div className="p-3 border-b-2" />;
};

const LeaderboardTable = ({ data }: { data: Leaderboard[] }) => {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Rank</Table.Th>
          <Table.Th>Player</Table.Th>
          <Table.Th>Score</Table.Th>
          <Table.Th>Date</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((entry, index) => (
          <Table.Tr key={entry.id}>
            <Table.Td>{index + 1}</Table.Td>
            <Table.Td>{entry.player}</Table.Td>
            <Table.Td>{entry.score}</Table.Td>
            <Table.Td>
              {new Date(entry.createdAt).toLocaleDateString()}
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};

export default App;
