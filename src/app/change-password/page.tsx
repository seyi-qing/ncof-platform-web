'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole } from 'lucide-react'
import { API_BASE, getSession, setSession } from '@/lib/api'
import { Button, ErrorBox, Field } from '@/components/UI'

type ChangePasswordResponse = {
  access_token: string
  refresh_token?: string | null
  token_type?: string
  must_change_password?: boolean
}

export default function ChangePasswordPage() {
  const router = useRouter()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [success, setSuccess] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const session = getSession()

    if (!session?.access_token) {
      router.replace('/login')
      return
    }

    if (!session.must_change_password) {
      router.replace('/dashboard')
      return
    }

    setReady(true)
  }, [router])

  async function submit(e: FormEvent) {
    e.preventDefault()

    setErr('')
    setSuccess('')

    if (!currentPassword) {
      setErr('Enter your current password.')
      return
    }

    if (!newPassword) {
      setErr('Enter your new password.')
      return
    }

    if (newPassword.length < 8) {
      setErr('Your new password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErr('The new passwords do not match.')
      return
    }

    if (newPassword === currentPassword) {
      setErr(
        'Your new password must be different from your current password.',
      )
      return
    }

    const session = getSession()

    if (!session?.access_token) {
      router.replace('/login')
      return
    }

    setBusy(true)

    try {
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
        cache: 'no-store',
      })

      const text = await response.text()

      let body: unknown = null

      if (text) {
        try {
          body = JSON.parse(text)
        } catch {
          body = text
        }
      }

      if (!response.ok) {
        if (
          body &&
          typeof body === 'object' &&
          'detail' in body
        ) {
          const detail = (body as { detail?: unknown }).detail

          if (typeof detail === 'string') {
            throw new Error(detail)
          }

          if (Array.isArray(detail)) {
            throw new Error(
              detail
                .map((item) => {
                  if (
                    item &&
                    typeof item === 'object' &&
                    'msg' in item
                  ) {
                    return String(
                      (item as { msg: unknown }).msg,
                    )
                  }

                  return String(item)
                })
                .join('; '),
            )
          }
        }

        if (
          body &&
          typeof body === 'object' &&
          'message' in body &&
          typeof (body as { message?: unknown }).message ===
            'string'
        ) {
          throw new Error(
            String(
              (body as { message: string }).message,
            ),
          )
        }

        if (typeof body === 'string' && body) {
          throw new Error(body)
        }

        throw new Error(
          `Password change failed (${response.status})`,
        )
      }

      const result = body as ChangePasswordResponse

      if (!result?.access_token) {
        throw new Error(
          'The password was changed, but the server did not return a new access token.',
        )
      }

      setSession({
        access_token: result.access_token,
        refresh_token:
          result.refresh_token ?? session.refresh_token ?? null,
        token_type:
          result.token_type ?? session.token_type ?? 'bearer',
        must_change_password:
          result.must_change_password ?? false,
      })

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      setSuccess(
        'Your password has been changed successfully.',
      )

      window.setTimeout(() => {
        router.replace('/dashboard')
      }, 700)
    } catch (ex: unknown) {
      setErr(
        ex instanceof Error
          ? ex.message
          : String(ex),
      )
    } finally {
      setBusy(false)
    }
  }

  function signOut() {
    localStorage.removeItem('ncof_session')
    router.replace('/login')
  }

  if (!ready) {
    return (
      <div className="loading">
        Loading NCOF Portal…
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="logo" aria-hidden>
          N
        </div>

        <h1>Secure your NCOF account.</h1>

        <p>
          Your account requires a new password before you can
          continue to the NCOF platform.
        </p>

        <div className="pill-row">
          <span className="badge blue">
            Password security
          </span>
          <span className="badge blue">
            NCOF Portal
          </span>
        </div>
      </div>

      <div className="login-box">
        <div className="login-card">
          <LockKeyhole
            size={28}
            color="#3b82f6"
            aria-hidden
          />

          <h2>Change password</h2>

          <p>
            Create a new password to continue.
          </p>

          {err && <ErrorBox message={err} />}

          {success && (
            <div
              className="card"
              role="status"
              style={{
                marginBottom: 16,
                borderColor: 'rgba(34, 197, 94, 0.35)',
              }}
            >
              <strong>Password changed successfully.</strong>

              <div
                className="muted"
                style={{ marginTop: 4 }}
              >
                Redirecting to your dashboard…
              </div>
            </div>
          )}

          <form onSubmit={submit}>
            <Field
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e: any) =>
                setCurrentPassword(e.target.value)
              }
              required
              autoComplete="current-password"
              placeholder="Enter your current password"
            />

            <Field
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e: any) =>
                setNewPassword(e.target.value)
              }
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />

            <Field
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e: any) =>
                setConfirmPassword(e.target.value)
              }
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Enter the new password again"
            />

            <Button
              loading={busy}
              type="submit"
            >
              Change password
            </Button>
          </form>

          <button
            type="button"
            onClick={signOut}
            disabled={busy}
            style={{
              width: '100%',
              marginTop: 16,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: busy ? 'not-allowed' : 'pointer',
              fontSize: 12,
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
        }
