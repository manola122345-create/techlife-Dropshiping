import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile,
  GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// 🔐 Emails admins — ajoute ton email ici
const ADMIN_EMAILS = ["admin@techlife.store", "ton@email.com"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  async function register(email, password, firstName, lastName) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: `${firstName} ${lastName}` });
    await setDoc(doc(db, "customers", user.uid), {
      firstName, lastName, email, createdAt: serverTimestamp()
    });
    return user;
  }

  async function login(email, password) { return signInWithEmailAndPassword(auth, email, password); }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const ref = doc(db, "customers", result.user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const names = (result.user.displayName || "").split(" ");
      await setDoc(ref, { firstName: names[0] || "", lastName: names.slice(1).join(" ") || "", email: result.user.email, createdAt: serverTimestamp() });
    }
    return result;
  }

  async function logout() { return signOut(auth); }
  async function resetPassword(email) { return sendPasswordResetEmail(auth, email); }

  async function loadProfile(uid) {
    const snap = await getDoc(doc(db, "customers", uid));
    if (snap.exists()) setProfile({ id: snap.id, ...snap.data() });
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await loadProfile(u.uid);
      else setProfile(null);
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, register, login, loginWithGoogle, logout, resetPassword, loadProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
