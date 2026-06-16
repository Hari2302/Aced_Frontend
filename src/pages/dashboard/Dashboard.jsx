import Sidebar from "../../components/layout/Sidebar";
import DashboardHome from "./DashboardHome";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#F5FAF8]">
      <Sidebar />
      <DashboardHome />
    </div>
  );
};

export default Dashboard;
