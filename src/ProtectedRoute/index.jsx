import { Navigate } from "react-router-dom";
import Cookies from "js-cookie"

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = Cookies.get("jwt_token");

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;