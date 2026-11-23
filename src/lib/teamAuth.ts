import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, firebaseConfig } from "./firebase";
import { UserRole } from "../types";

/**
 * Creates a new team user via a secondary Firebase App instance.
 * CRITICAL: This prevents the logged-in master_admin from being signed out!
 */
export async function createTeamMemberSecondary(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}): Promise<{ success: boolean; uid?: string; error?: string }> {
  const secondaryAppName = `SecondaryCreator_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      data.email.trim(),
      data.password
    );
    const newUid = userCredential.user.uid;

    // Immediately save user profile to Firestore 'users/{uid}'
    await setDoc(doc(db, 'users', newUid), {
      uid: newUid,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim() || '',
      role: data.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    // Clean up secondary auth session and app instance
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);

    return { success: true, uid: newUid };
  } catch (err: any) {
    try {
      await deleteApp(secondaryApp);
    } catch {}
    return { success: false, error: err.message || 'Failed to create user' };
  }
}
