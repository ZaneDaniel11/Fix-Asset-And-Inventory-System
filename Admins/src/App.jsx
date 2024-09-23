import { Route, Routes } from "react-router-dom";
import RequestItems from "./Admin/RequestItems";

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<RequestItems />} />
      </Routes>
    </div>
  );
}

export default App;
