import Dashboard from "./Dashboard";

import { Route, Routes } from "react-router-dom";
import Electronics from "./Tables/Electornics.jsx";
import Login from "./Login.jsx";
import RequestItems from "./Tables/Request.jsx";
import Maintenance from "./Tables/Maintenance.jsx";

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/Login" element={<Login />} />
        <Route exact path="/Electronics" element={<Electronics />} />
        <Route exact path="/" element={<Dashboard />} />
        <Route exact path="/RequestItems" element={<RequestItems />} />
        <Route exact path="/Maintenance" element={<Maintenance />} />
      </Routes>
    </div>
  );
}

export default App;
