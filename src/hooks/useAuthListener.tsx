import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { useDispatch } from "react-redux";
import { authSuccess, authLogout } from "../redux/authSlice";

export default function useAuthListener() {
  const dispatch = useDispatch();
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          authSuccess({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
          })
        );
      } else {
        dispatch(authLogout());
      }
    });
    return () => unsub();
  }, [dispatch]);
}
