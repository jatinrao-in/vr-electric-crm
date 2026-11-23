import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

export const MASTER_ADMIN_EMAIL = 'info.raojatin@gmail.com';

export const isMasterAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
};

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Real-time listener for persistent Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userEmail = user.email || '';
          const userDocRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userDocRef);
          
          if (isMasterAdminEmail(userEmail)) {
            // EXCLUSIVE MASTER ADMIN (info.raojatin@gmail.com)
            // Auto-bootstrap / ensure role is master_admin and isActive is true
            if (!snap.exists() || snap.data()?.role !== 'master_admin' || !snap.data()?.isActive) {
              const masterProfile: UserProfile = {
                uid: user.uid,
                email: MASTER_ADMIN_EMAIL,
                name: user.displayName || 'Master Admin',
                role: 'master_admin',
                isActive: true,
                createdAt: snap.exists() ? (snap.data().createdAt || new Date().toISOString()) : new Date().toISOString(),
              };
              await setDoc(userDocRef, masterProfile, { merge: true });
              setCurrentUser(masterProfile);
            } else {
              setCurrentUser(snap.data() as UserProfile);
            }
          } else {
            // ALL OTHER USERS
            if (snap.exists()) {
              const data = snap.data() as UserProfile;

              // Security Rule: If any other user somehow has role === 'master_admin' or 'super_admin'
              // but their email is NOT info.raojatin@gmail.com, treat them as unauthorized and block access!
              if ((data.role === 'master_admin' || (data.role as any) === 'super_admin')) {
                console.warn(`Unauthorized attempt to assume master_admin role by ${userEmail}.`);
                await fbSignOut(auth);
                setCurrentUser(null);
                setLoading(false);
                return;
              }

              if (!data.isActive) {
                await fbSignOut(auth);
                setCurrentUser(null);
              } else {
                setCurrentUser(data);
              }
            } else {
              // Un-provisioned non-master user: block access
              console.warn(`Unregistered user login attempt: ${userEmail}`);
              await fbSignOut(auth);
              setCurrentUser(null);
            }
          }
        } catch (err) {
          console.error("Error fetching authenticated user profile:", err);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const cleanEmail = email.trim();
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const userDocRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userDocRef);

      if (isMasterAdminEmail(cleanEmail)) {
        // EXCLUSIVE MASTER ADMIN AUTO-BOOTSTRAP
        if (!snap.exists() || snap.data()?.role !== 'master_admin' || !snap.data()?.isActive) {
          const masterProfile: UserProfile = {
            uid: cred.user.uid,
            email: MASTER_ADMIN_EMAIL,
            name: cred.user.displayName || 'Master Admin',
            role: 'master_admin',
            isActive: true,
            createdAt: snap.exists() ? (snap.data().createdAt || new Date().toISOString()) : new Date().toISOString(),
          };
          await setDoc(userDocRef, masterProfile, { merge: true });
          setCurrentUser(masterProfile);
        } else {
          setCurrentUser(snap.data() as UserProfile);
        }
        setLoading(false);
        return { success: true };
      }

      // OTHER USERS
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;

        // Block unauthorized master_admin claims
        if (profile.role === 'master_admin' || (profile.role as any) === 'super_admin') {
          await fbSignOut(auth);
          setLoading(false);
          return { success: false, error: 'Unauthorized role assignment. Access denied.' };
        }

        if (!profile.isActive) {
          await fbSignOut(auth);
          setLoading(false);
          return { success: false, error: 'Your account has been deactivated. Please contact the Master Admin.' };
        }

        setCurrentUser(profile);
        setLoading(false);
        return { success: true };
      } else {
        await fbSignOut(auth);
        setLoading(false);
        return { success: false, error: 'Account not found. Please contact the Master Admin for access.' };
      }
    } catch (err: any) {
      setLoading(false);
      let errMsg = 'Invalid email or password.';
      if (err.code === 'auth/user-not-found') errMsg = 'User not found. Please contact Master Admin.';
      if (err.code === 'auth/wrong-password') errMsg = 'Incorrect password.';
      if (err.code === 'auth/too-many-requests') errMsg = 'Too many attempts. Please try again later.';
      if (err.code === 'auth/network-request-failed') errMsg = 'Network error. Please check your connection.';
      return { success: false, error: errMsg };
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn("Logout notice:", e);
    }
    setCurrentUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
