import { useLayoutEffect, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { observeAuthState } from "./services/firebase/authService";
import { setUser } from "./features/auth/authSlice";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  // Apply theme to DOM before paint using useLayoutEffect
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);


  useEffect(() => {
    const unsubscribe = observeAuthState((firebaseUser) => {
      if (firebaseUser) {
        dispatch(
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          })
        );
      } else {
        dispatch(setUser(null));
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;
