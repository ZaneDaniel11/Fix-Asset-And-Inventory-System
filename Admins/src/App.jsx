import { Route, Routes } from "react-router-dom";
import Borrow from "./Admin/Borrow";
import Admin1Logs from "./Admin/Logs";
import SuperBorrow from "./SuperiorAdmin/SuperBorrow";
import SuperLogs from "./SuperiorAdmin/SuperLogs";

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<Borrow />} />
        <Route exact path="/SuperBorrow" element={<SuperBorrow />} />
        <Route exact path="/SuperLogs" element={<SuperLogs />} />
        <Route exact path="/Logs" element={<Admin1Logs />} />
      </Routes>
    </div>
  );
}

export default App;
