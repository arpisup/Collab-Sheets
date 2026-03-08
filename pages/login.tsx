import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import {
  browserLocalPersistence,
  getRedirectResult,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  type AuthError,
} from "firebase/auth"
import { auth } from "../lib/firebase"
import { useAuthStore, randomColor, randomId } from "../store/authStore"

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Complete redirect-based sign in flow when popup is blocked by browser.
    getRedirectResult(auth)
      .then((result) => {
        const u = result?.user
        if (!u) return
        setUser({
          uid: u.uid,
          displayName: u.displayName || "User",
          color: randomColor(),
          provider: "google",
        })
        router.replace("/dashboard")
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Google sign-in failed"
        setError(message)
      })
  }, [router, setUser])

  function handleGuest() {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Please enter a display name")
      return
    }
    setUser({
      uid: randomId(),
      displayName: trimmed,
      color: randomColor(),
      provider: "guest",
    })
    router.push("/dashboard")
  }

  async function handleGoogle() {
    try {
      setError("")
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      await setPersistence(auth, browserLocalPersistence)
      const result = await signInWithPopup(auth, provider)
      const u = result.user
      setUser({
        uid: u.uid,
        displayName: u.displayName || "User",
        color: randomColor(),
        provider: "google",
      })
      router.push("/dashboard")
    } catch (err: unknown) {
      const authErr = err as Partial<AuthError> | undefined
      const code = authErr?.code || ""

      if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
        const provider = new GoogleAuthProvider()
        provider.setCustomParameters({ prompt: "select_account" })
        await signInWithRedirect(auth, provider)
        return
      }

      if (code === "auth/unauthorized-domain") {
        setError(
          "This domain is not authorized in Firebase Auth. Add your Render domain in Firebase Console -> Authentication -> Settings -> Authorized domains."
        )
        return
      }

      if (code === "auth/operation-not-allowed") {
        setError("Google provider is disabled in Firebase Authentication. Enable Google sign-in in the Firebase console.")
        return
      }

      const message = err instanceof Error ? err.message : "Google sign-in failed"
      setError(message)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#1d6ce0" />
            <rect x="5" y="5" width="7" height="7" rx="1.5" fill="#b8d4f0" />
            <rect x="16" y="5" width="7" height="7" rx="1.5" fill="#7ab8f5" />
            <rect x="5" y="16" width="7" height="7" rx="1.5" fill="#7ab8f5" />
            <rect x="16" y="16" width="7" height="7" rx="1.5" fill="#b8d4f0" />
          </svg>
          <span className="login-brand">Sheets</span>
        </div>

        <h1 className="login-title">Welcome</h1>
        <p className="login-subtitle">Set your display name to get started</p>

        {error && <div className="login-error">{error}</div>}

        <input
          className="login-input"
          type="text"
          placeholder="Your display name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError("") }}
          onKeyDown={(e) => e.key === "Enter" && handleGuest()}
          maxLength={30}
          autoFocus
        />

        <button className="btn-primary" onClick={handleGuest}>
          Continue as Guest
        </button>

        <div className="login-divider">
          <span>or</span>
        </div>

        <button className="btn-google" onClick={handleGoogle}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
