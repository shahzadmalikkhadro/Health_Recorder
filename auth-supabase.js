/**
 * Authentication module - uses Supabase
 */
import { supabase } from "./supabase.js";

/**
 * Register new user with email/password
 */
export async function registerUser(email, password, name) {
  try {
    // Create user account with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return { success: false, message: getAuthErrorMessage(signUpError.message) };
    }

    const user = data.user;

    // Create user profile in users table
    try {
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: user.id,
            name,
            email,
            avatar_url: null,
            created_at: new Date().toISOString(),
          }
        ]);

      if (insertError) {
        console.warn("Profile creation failed:", insertError);
      }
    } catch (firestoreError) {
      console.warn("Failed to save user profile", firestoreError);
    }

    return { 
      success: true, 
      message: "Account created! Please check your email to confirm.", 
      user: { 
        id: user.id, 
        email: user.email, 
        name: name 
      } 
    };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, message: "Registration failed. Please try again." };
  }
}

/**
 * Login with email/password
 */
export async function loginUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, message: getAuthErrorMessage(error.message) };
    }

    const user = data.user;
    return {
      success: true,
      message: "Login successful!",
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.user_metadata?.name || email.split('@')[0] 
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: getAuthErrorMessage(error.message) };
  }
}

/**
 * Login with Google (requires Google OAuth setup in Supabase)
 */
export async function loginWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      return { success: false, message: getAuthErrorMessage(error.message) };
    }

    return {
      success: true,
      message: "Google login redirecting...",
    };
  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, message: getAuthErrorMessage(error.message) };
  }
}

/**
 * Logout
 */
export async function logoutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, message: "Failed to logout." };
    }
    return { success: true, message: "Logout successful!" };
  } catch (error) {
    return { success: false, message: "Failed to logout." };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function listenToAuthState(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      const user = session?.user;
      callback({
        isAuthenticated: !!user,
        user: user 
          ? { 
              id: user.id, 
              email: user.email, 
              name: user.user_metadata?.name || user.email.split('@')[0],
              avatar_url: user.user_metadata?.avatar_url || null
            } 
          : null,
      });
    }
  );

  // Return unsubscribe function
  return () => {
    subscription?.unsubscribe();
  };
}

/**
 * Redirect if already authenticated
 */
export function redirectIfAuthenticated(redirectUrl = "dashboard4.html") {
  listenToAuthState((authState) => {
    if (authState.isAuthenticated) {
      window.location.href = redirectUrl;
    }
  });
}

/**
 * Helper function to format error messages
 */
function getAuthErrorMessage(code) {
  const messages = {
    "Invalid login credentials": "Incorrect email or password.",
    "Email not confirmed": "Please verify your email before logging in.",
    "User already registered": "An account with this email already exists.",
    "Password should be at least 6 characters": "Password must be at least 6 characters.",
    "weak password": "Password is too weak. Use uppercase, numbers, and symbols.",
  };

  return messages[code] || code || "An error occurred. Please try again.";
}
