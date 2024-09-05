import { Route, Routes } from "react-router-dom";
import Login from "./Login.jsx";
import Maintenance from "./Tables/Maintenance.jsx";
import Users from "./Tables/User.jsx";
import RequestItems from "./Tables/Request.jsx";
import Inventory from "./Inventory.jsx";
import Dashboard from "./Dashboard.jsx";
import Inventory_table from "./Tables/Inventory_table.jsx";

function App() {
  return (
    <div>
      <Routes>
        <Route exact path="/" element={<Dashboard />} />
        <Route exact path="/Login" element={<Login />} />
        <Route exact path="/Request" element={<RequestItems />} />
        <Route exact path="/inventory" element={<Inventory />} />
        <Route exact path="/Maintenance" element={<Maintenance />} />
        <Route exact path="/Users" element={<Users />} />
        <Route exact path="/InventoryTable " element={<Inventory_table />} />
      </Routes>
    </div>
  );
}

export default App;
