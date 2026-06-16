import { Navigate, useLocation } from "react-router-dom";
import { isStudentAuthenticated } from "../services/studentPortalAuth";

const StudentPrivateRoute = ({ children }) => {
  const location = useLocation();
  return isStudentAuthenticated() ? (
    children
  ) : (
    <Navigate to="/student/login" state={{ from: location }} replace />
  );
};

export default StudentPrivateRoute;
