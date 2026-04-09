import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  bio?: string;
  notificationsEnabled: boolean;
  updatedAt: string;
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const saveUserProfile = async (profile: Partial<UserProfile> & { uid: string }) => {
  const docRef = doc(db, "users", profile.uid);
  const docSnap = await getDoc(docRef);
  
  const data = {
    ...profile,
    updatedAt: new Date().toISOString()
  };

  if (docSnap.exists()) {
    await updateDoc(docRef, data);
  } else {
    await setDoc(docRef, data);
  }
};
