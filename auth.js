/**
 * Authentication module - uses root firebase.js (npm)
 */
import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

/**
 * Register new user with email/password
 */
export async function registerUser(email, password, name) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: name });

    // Create user profile document in Firestore (best-effort).
    // If Firestore isn't enabled yet or rules deny access, we still consider signup successful
    // because Firebase Auth user creation already succeeded.
    try {
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        createdAt: serverTimestamp(),
        photoURL: user.photoURL || null,
      });
    } catch (firestoreError) {
      console.warn("Firestore user profile creation failed:", firestoreError);
    }

    return { success: true, message: "Account created!", user: { uid: user.uid, email, displayName: name } };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: getAuthErrorMessage(error?.code) };
  }
}

/**
 * Login with email/password
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return {
      success: true,
      message: "Login successful!",
      user: { uid: user.uid, email: user.email, displayName: user.displayName },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: getAuthErrorMessage(error?.code) };
  }
}

/**
 * Login with Google
 */
export async function loginWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Best-effort profile creation (same reasoning as registerUser)
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          name: user.displayName,
          email: user.email,
          createdAt: serverTimestamp(),
          photoURL: user.photoURL,
        });
      }
    } catch (firestoreError) {
      console.warn("Firestore user profile creation failed:", firestoreError);
    }

    return {
      success: true,
      message: "Google login successful!",
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      },
    };
  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, message: getAuthErrorMessage(error?.code) };
  }
}

/**
 * Logout
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true, message: "Logout successful!" };
  } catch (error) {
    return { success: false, message: "Failed to logout." };
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Listen to auth state
 */
export function listenToAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback({
      isAuthenticated: !!user,
      user: user ? { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL } : null,
    });
  });
}

/**
 * Redirect if already authenticated
 */
export function redirectIfAuthenticated(redirectUrl = "/dashboard4.html") {
  listenToAuthState((authState) => {
    if (authState.isAuthenticated) {
      window.location.href = redirectUrl;
    }
  });
}

function getAuthErrorMessage(code) {
  const messages = {
    "auth/email-already-in-use": "This email is already registered.",
    "auth/invalid-email": "Invalid email address.",
    "auth/invalid-api-key": "Firebase API key is invalid. Check your firebase.js config.",
    "auth/project-not-found": "Firebase project not found. Check your firebase.js config.",
    "auth/unauthorized-domain": "Unauthorized domain. Add localhost to Firebase Auth authorized domains.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase Console.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/too-many-requests": "Too many attempts. Try again later.",
    "auth/popup-closed-by-user": "Sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Check your internet connection and try again.",
  };
  return messages[code] || `An error occurred. Please try again. (${code || "unknown"})`;
}
