import { Navigate } from "react-router-dom";

interface PublicRouteProps {
    children: any;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const token = localStorage.getItem("token");

    // If already logged in, redirect to home
    return token ? <Navigate to="/home" replace /> : <>{children}</>;
};

export default PublicRoute;
