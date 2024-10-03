import { Route, Routes } from "react-router-dom";
import Borrow from "./Admin/Borrow";
import Admin1Logs from "./Admin/Logs";
import Request from "./Admin/RequestItems";
import SuperBorrow from "./SuperiorAdmin/SuperBorrow";
import SuperLogs from "./SuperiorAdmin/SuperLogs";
import SuperRequest from "./SuperiorAdmin/SuperRequestItems";

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<Borrow />} />
        <Route exact path="/Logs" element={<Admin1Logs />} />
        <Route exact path="/Request" element={<Request />} />

        <Route exact path="/SuperBorrow" element={<SuperBorrow />} />
        <Route exact path="/SuperLogs" element={<SuperLogs />} />
        <Route exact path="/SuperRequest" element={<SuperRequest />} />
      </Routes>
    </div>
  );
}

export default App;
