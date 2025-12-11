
import { Navigate, useLocation } from "react-router-dom";

interface PrivateRouteProps {
  children: any;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  return token ? (
    <>{children}</> // React fragment
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default PrivateRoute;
