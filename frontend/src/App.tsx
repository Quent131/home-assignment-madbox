import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiService } from "./api";
import {
  ActionIcon,
  Alert,
  Loader,
  Modal,
  TextInput,
  Title,
} from "@mantine/core";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { useDisclosure } from "@mantine/hooks";
import { v4 as uuidv4 } from "uuid";
import { Game } from "@madbox-assignment/types";
import { useEffect, useMemo, useState } from "react";

const LOCAL_STORAGE_KEY = "game-player-data";

const setLocalStorage = (data: Game) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

function App() {
  const [answer, setAnswer] = useState("");
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

  // const renderCountRef = useRef(0);
  // useEffect(() => {
  //   renderCountRef.current++;
  //   console.log(`Rendered ${name} ${renderCountRef.current} times`);
  // });

  const { data, isLoading } = useQuery({
    queryKey: ["word"],
    queryFn: () => {
      if (playerData.currentWordId === 0) return apiService.getWord();
      return apiService.getWordById(playerData.currentWordId);
    },
    staleTime: 60000,
  });

  useEffect(() => {
    if (data) {
      playerData.currentWordId = data.id;
      setLocalStorage(playerData);
    }
  }, [data, playerData]);

  const [opened, { open, close }] = useDisclosure();
  // const [
  //   victoryModalOpened,
  //   { open: openVictoryModal, close: closeVictoryModal },
  // ] = useDisclosure();
  // const [
  //   defeatModalOpened,
  //   { open: openDefeatModal, close: closeDefeatModal },
  // ] = useDisclosure();

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
      alert("You won!");
      playerData.points = 10;
    } else if (playerData.points === 0) {
      alert("You lost!");
      playerData.points = 10;
    }

    playerData.currentWordId = 0;
    playerData.totalTries += 1;
    setLocalStorage(playerData);
    setAnswer("");
    queryClient.invalidateQueries({ queryKey: ["word"] });
  };

  return data ? (
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
      {/* <Modal
        opened={resultModalOpened}
        onClose={closeResultModal}
        centered
        title="Congratulations !"
      ></Modal> */}
      <div className="flex flex-col gap-5">
        <Title order={1} className="text-center">
          Translatle
        </Title>
        <div className="flex items-center gap-2 justify-center">
          <p>Welcome to Translatle.</p>
          <ActionIcon onClick={open} variant="subtle" color="white">
            <QuestionMarkCircledIcon />
          </ActionIcon>
        </div>
        {isLoading ? (
          <Loader />
        ) : (
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
            />
          </div>
        )}
      </div>
    </div>
  ) : null;
}

const Letter = () => {
  return <div className="p-3 border-b-2" />;
};

export default App;
