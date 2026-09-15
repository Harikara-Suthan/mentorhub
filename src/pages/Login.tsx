import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api, apiErrorMessage } from "../api/client";
import { MentorHubLogo } from "../components/ui/MentorHubLogo";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { safeSetItem, safeSetJSON } from "../utils/storage";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        const { token, user } = event.data;
        if (token && user) {
          safeSetItem("maa_token", token);
          safeSetJSON("maa_user", user);
          window.location.href = "/dashboard";
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid email or password."));
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    setError("");
    
    // Pre-flight check: Verify if all required Firebase credentials are fully configured
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

    const missingVars = [];
    if (!apiKey || apiKey === "AIzaSyFakeKeyPlaceholderForMentorHubDev") {
      missingVars.push("VITE_FIREBASE_API_KEY");
    }
    if (!authDomain || authDomain === "mentorhub-academic.firebaseapp.com") {
      missingVars.push("VITE_FIREBASE_AUTH_DOMAIN");
    }
    if (!projectId || projectId === "mentorhub-academic") {
      missingVars.push("VITE_FIREBASE_PROJECT_ID");
    }

    if (missingVars.length > 0) {
      setError(`Firebase Google Sign-In is not fully configured. Missing parameters in Settings: ${missingVars.join(", ")}. Please define them in your workspace Settings menu.`);
      return;
    }

    setLoading(true);
    try {
      if (!auth || !googleProvider) {
        throw new Error("Firebase Authentication is not configured.");
      }
      const userCredential = await signInWithPopup(auth, googleProvider);
      const idToken = await userCredential.user.getIdToken();

      const response = await fetch(`${window.location.origin}/api/auth/firebase-google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(
          resData.message || "This Google account is not registered in MentorHUB. Please contact your administrator."
        );
      }

      const { token, user } = resData.data;
      if (token && user) {
        safeSetItem("maa_token", token);
        safeSetJSON("maa_user", user);
        // Redirecting directly to sync authentication session
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      console.error("Google login failed:", err);
      
      // Gracefully handle user cancelling the popup
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request" || err.code === "auth/user-cancelled") {
        setLoading(false);
        return;
      }

      // Friendly, descriptive guides for common Firebase Console config issues
      let readableError = err.message || "This Google account is not registered in MentorHUB. Please contact your administrator.";
      
      if (err.message?.includes("auth/unauthorized-domain")) {
        readableError = `Firebase Config Error: The current domain '${window.location.hostname}' is not authorized in your Firebase Project. To fix: Go to Firebase Console -> Build -> Authentication -> Settings -> Authorized Domains, click 'Add Domain', and paste: ${window.location.hostname}`;
      } else if (err.message?.includes("auth/configuration-not-found")) {
        readableError = "Firebase Config Error: The 'Google' Sign-In Provider is not enabled on your Firebase project yet. To fix: Go to your Firebase Console -> Build -> Authentication -> Sign-in Method, enable 'Google', and save.";
      } else if (err.message?.includes("auth/api-key-not-valid")) {
        readableError = "Firebase Config Error: Your VITE_FIREBASE_API_KEY is invalid or restricted. Please double-check your Firebase Web App configuration credentials in your Settings.";
      } else if (err.message?.includes("Firebase") || err.message?.includes("auth/")) {
        readableError = `Firebase Error: ${err.message}`;
      }
      
      setError(readableError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-100 flex flex-col items-center justify-center relative p-4 sm:p-6 md:p-8">
      {/* Background elegant subtle radial gradient in blue */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-sky-100/40 blur-3xl pointer-events-none" />

      {/* Main Single Centered Login Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl p-8 sm:p-10">
          
          {/* Header section inside card */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="mb-3">
              <MentorHubLogo size="lg" theme="light" animate />
            </div>
            <div className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase mb-4">
              GUIDE • CONNECT • GROW
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Sign in to your account
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Institutional Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  autoComplete="username"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => {
                    const email = prompt("Enter your institutional email:");
                    if (email) {
                      api.post("/auth/forgot-password", { email }).then(() => alert("Check your console for the reset token (simulated email)")).catch(err => alert(apiErrorMessage(err)));
                    }
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <>
                  <span>Sign in to MentorHUB</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Social login divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Or</span>
            </div>
          </div>

          {/* Google Login Option */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200 shadow-xs disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

        </div>
      </div>
    </div>
  );
}
