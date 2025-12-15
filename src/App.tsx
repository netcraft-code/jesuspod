import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUserFromToken } from "./redux/authSlice";
import AllRoutes from "./routes/AllRoutes";
import type { AppDispatch } from "./redux/store"; // <- add this
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  const dispatch = useDispatch<AppDispatch>(); // <- typed dispatch

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      dispatch(fetchUserFromToken());  // Refresh par user load
    }
  }, []);

 return (
  <>
    <ScrollToTop />
    <AllRoutes />
  </>
);

}
