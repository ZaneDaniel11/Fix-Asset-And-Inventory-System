import Dashboard from "./Dashboard";
import "./app.css";
import { Route, Routes } from "react-router-dom";
import Sample from "./sample.jsx";
import Electronics from "./Tables/Electornics.jsx";
import Login from "./Login.jsx";

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/Login" element={<Login />} />
        <Route exact path="/Electronics" element={<Electronics />} />
        <Route exact path="/" element={<Dashboard />} />
        <Route exact path="/sample" element={<Sample />} />
      </Routes>
    </div>
  );
}

export default App;
