import { useEffect } from "react"
import { useRouter } from "next/router"
import { useAuthStore } from "../store/authStore"

export default function Home() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (user) {
      router.replace("/dashboard")
    } else {
      router.replace("/login")
    }
  }, [router, user])

  return null
}
