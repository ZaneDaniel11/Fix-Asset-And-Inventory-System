import RequestTable from "./Components/Request_Trable";
import Sidebar from "../../Components/Sidebar";

export default function Request() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <RequestTable />
    </div>
  );
}
