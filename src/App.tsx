import { useLayoutEffect, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { observeAuthState } from "./services/firebase/authService";
import { setUser } from "./features/auth/authSlice";
import AppRoutes from "./routes/AppRoutes";
import ToastContainer from "./components/ui/ToastContainer";
import IFrameViewer from "./components/ui/IFrameViewer";
import ReminderSystem from "./components/ui/ReminderSystem";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

const App = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  
  // Initialize global shortcuts
  useKeyboardShortcuts();

  /* Apply theme before paint */
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  /* Firebase Auth Observer */
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

  return (
    <>
      <AppRoutes />
      <ToastContainer />
      <IFrameViewer />
      <ReminderSystem />
    </>
  );
};

export default App;