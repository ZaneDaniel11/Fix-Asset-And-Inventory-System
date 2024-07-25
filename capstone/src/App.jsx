import Dashboard from "./Dashboard";

import { Route, Routes } from "react-router-dom";
import Electronics from "./Tables/Electornics.jsx";
import Login from "./Login.jsx";
import Maintenance from "./Tables/Maintenance.jsx";
import Users from "./Tables/User.jsx";
import RequestItems from "./Tables/Request.jsx";

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/Login" element={<Login />} />
        <Route exact path="/Electronics" element={<Electronics />} />
        <Route exact path="/Request" element={<RequestItems />} />
        <Route exact path="/" element={<Dashboard />} />
        <Route exact path="/Maintenance" element={<Maintenance />} />
        <Route exact path="/Users" element={<Users />} />
      </Routes>
    </div>
  );
}

export default App;
