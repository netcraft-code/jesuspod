import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserFromToken } from "./redux/authSlice";
import { fetchInitialData } from "./redux/dataSlice";
import AllRoutes from "./routes/AllRoutes";
import type { AppDispatch, RootState } from "./redux/store";
import ScrollToTop from "./components/ScrollToTop";
import AIChat from "./components/AIChat/AIChat";

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      dispatch(fetchUserFromToken());  // Refresh par user load
    }
  }, []);

  // Fetch data when user is loaded or on app mount
  useEffect(() => {
    const userId = user?.uid;
    dispatch(fetchInitialData(userId) as any);
  }, [user]);

  return (
    <>
      <ScrollToTop />
      <AllRoutes />
      <AIChat />
    </>
  );

}
