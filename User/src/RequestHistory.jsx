import RequestTable from "./Table/Request_Trable";
import Sidebar from "./components/Sidebar";

export default function Request() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <RequestTable />
    </div>
  );
}
