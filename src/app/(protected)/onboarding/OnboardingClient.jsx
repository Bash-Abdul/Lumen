"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../../../shared/ui/Button"
import api from "@/shared/lib/api"

export default function OnboardingClient({ initialProfile }) {
  const router = useRouter()
  const [form, setForm] = useState({
  name: initialProfile?.name || "",
  username: initialProfile?.username || "",
  location: initialProfile?.location || "",
  bio: initialProfile?.bio || "",
  avatar: initialProfile?.avatar || "",
})
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus("")
    setError("")
    setLoading(true)

    try {
      // const res = await fetch("/api/profile/onboarding", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(form),
      // })

      const res = await api.post('/profile/onboarding', form)

      const data = res.data

      if (!data?.ok) {
        setError(data.message || "Failed to save onboarding")
        return
      }

      setStatus("Profile saved, redirecting...")
      router.push("/")
    } catch (err) {
      console.error("Onboarding submit error", err)
      setError("Something went wrong", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
            Onboarding
          </p>
          <h1 className="text-3xl font-semibold">Set up your profile</h1>
          <p className="text-sm text-zinc-400">
            Add your name, username and a few details to finish creating your
            account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Name"
              required
              className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
            />
            <input
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              placeholder="@username"
              pattern="^@?[a-zA-Z0-9_]{3,20}$"
              title="At least 3 characters, letters, numbers, underscore"
              required
              className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <input
            value={form.location}
            onChange={(e) =>
              setForm({ ...form, location: e.target.value })
            }
            placeholder="Location (optional)"
            className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          />
          <textarea
            value={form.bio}
            onChange={(e) =>
              setForm({ ...form, bio: e.target.value })
            }
            placeholder="Bio (optional)"
            rows={3}
            className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          />
          <input
            value={form.avatar}
            onChange={(e) =>
              setForm({ ...form, avatar: e.target.value })
            }
            placeholder="Avatar URL (optional)"
            className="w-full rounded-xl bg-zinc-900/80 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-400"
          />

          {error && (
            <p className="text-xs text-red-400">
              {error}
            </p>
          )}
          {status && !error && (
            <p className="text-xs text-zinc-400">
              {status}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  )
}
