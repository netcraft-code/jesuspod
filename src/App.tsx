import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserFromToken } from "./redux/authSlice";
import {
  fetchInitialData,
  refreshSavedBooks,
  refreshSavedChannels,
  refreshSavedMovies,
  refreshSavedRadios,
  refreshSavedPodcasts
} from "./redux/dataSlice";
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
    // Fetch initial data ONCE on app mount
    dispatch(fetchInitialData() as any);
  }, []);

  // When user is loaded, fetch only user's saved items in background without re-fetching all collections
  useEffect(() => {
    if (user?.uid) {
      dispatch(refreshSavedBooks(user.uid) as any);
      dispatch(refreshSavedChannels(user.uid) as any);
      dispatch(refreshSavedMovies(user.uid) as any);
      dispatch(refreshSavedRadios(user.uid) as any);
      dispatch(refreshSavedPodcasts(user.uid) as any);
    }
  }, [user?.uid]);

  return (
    <>
      <ScrollToTop />
      <AllRoutes />
      <AIChat />
    </>
  );

}
