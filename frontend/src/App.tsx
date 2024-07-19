import "./App.css";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "./api";
import { Title } from "@mantine/core";

function App() {
  const { data } = useQuery({
    queryKey: ["word"],
    queryFn: apiService.getWord,
  });
  return (
    <div className="flex flex-col gap-3">
      <Title order={1}>Translatle</Title>
      <p>Welcome to Translatle.</p>
      {data?.french}
    </div>
  );
}

export default App;
