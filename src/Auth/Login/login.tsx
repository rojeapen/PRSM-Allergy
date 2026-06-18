import { StrictMode, useState, type FormEvent } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'
import '../auth.css'
import Logo from '../../assets/favicon.svg'
import { login } from '../../api/auth'
import { ORIGIN } from '../../constants'
import { AlertIcon, EyeIcon, EyeOffIcon } from '../icons'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function App() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        if (loading) return

        const next: { email?: string; password?: string } = {}
        if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address.'
        if (password.length === 0) next.password = 'Enter your password.'
        setFieldErrors(next)
        setFormError('')
        if (Object.keys(next).length > 0) return

        setLoading(true)
        const result = await login(email.trim(), password)
        if (result === 'Success') {
            window.location.href = ORIGIN + 'Dashboard/'
            return
        }
        setFormError(result)
        setLoading(false)
    }

    return (
        <main className="auth-page">
            <div className="auth-shell">
                <button
                    type="button"
                    className="auth-brand"
                    onClick={() => { window.location.href = ORIGIN }}
                    aria-label="PRSM Allergy Foundation, home"
                >
                    <img src={Logo} alt="" className="auth-logo" />
                    <span className="auth-brand-name">PRSM Allergy Foundation</span>
                </button>

                <div className="auth-card">
                    <div className="auth-head">
                        <span className="auth-kicker">Team access</span>
                        <h1>Sign in</h1>
                        <p>Sign in to manage events, fundraisers, articles, and the foundation site.</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        {formError && (
                            <div className="auth-alert" role="alert">
                                <AlertIcon />
                                <span>{formError}</span>
                            </div>
                        )}

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="input"
                                value={email}
                                autoComplete="email"
                                autoFocus
                                aria-invalid={fieldErrors.email ? 'true' : undefined}
                                aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }))
                                }}
                            />
                            {fieldErrors.email && (
                                <span className="auth-field-error" id="email-error">{fieldErrors.email}</span>
                            )}
                        </div>

                        <div className="auth-field">
                            <label className="auth-label" htmlFor="password">Password</label>
                            <div className="auth-password">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="input"
                                    value={password}
                                    autoComplete="current-password"
                                    aria-invalid={fieldErrors.password ? 'true' : undefined}
                                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }))
                                    }}
                                />
                                <button
                                    type="button"
                                    className="auth-reveal"
                                    onClick={() => setShowPassword((s) => !s)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    aria-pressed={showPassword}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <span className="auth-field-error" id="password-error">{fieldErrors.password}</span>
                            )}
                        </div>

                        <button type="submit" className="btn-primary btn-block auth-submit" disabled={loading}>
                            {loading ? <span className="auth-spinner" aria-hidden="true" /> : 'Sign in'}
                            <span className="sr-only">{loading ? 'Signing in' : ''}</span>
                        </button>
                    </form>
                </div>

                <p className="auth-alt">
                    Need an account?{' '}
                    <a className="btn-link" href={ORIGIN + 'Auth/Signup/'}>Create one with an access code</a>
                </p>
            </div>
        </main>
    )
}

export default App
