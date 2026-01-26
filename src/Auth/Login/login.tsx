import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '../../index.css'




import "./login.css"
import { login } from '../../api/auth'
import { ORIGIN } from '../../constants'


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

function App() {
    const [isMobile, setIsMobile] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)



    useEffect(() => {


        const handleResize = () => {
            if (window.innerWidth < 800) {
                setIsMobile(true)
            } else {
                setIsMobile(false)
            }
        }
        window.addEventListener('resize', handleResize)
        handleResize()
        return () => window.removeEventListener('resize', handleResize)
    }, [])
    return (
        <>
            <div className="login">
                <h1>Login</h1>
                <div className='login-items'>
                    <div className='login-item'>
                        <label htmlFor="email" >Email</label>
                        <input type="text" id="email" value={email} className='input' onChange={(e) => setEmail(e.target.value)} />

                    </div>
                    <div className='login-item'>
                        <label htmlFor="password" >Password</label>
                        <input type="password" id="password" className='input' value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>

                </div>
                <div className='ActionBtns'>
                    {loading ? <div className='loader'></div> : <button className='btn-secondary' onClick={async () => {
                        setLoading(true)
                        //verify valid email
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                        if (!emailRegex.test(email)) {
                            alert("Please enter a valid email address.")
                            setLoading(false)
                            return
                        }
                        if (password.length <= 0) {
                            alert("Please enter a password.")
                            setLoading(false)
                            return
                        }
                        const loggedIn = await login(email, password)
                        if (loggedIn !== "Success") {
                            alert("Error logging in: " + loggedIn)
                            setLoading(false)
                            return
                        }
                        window.location.href = ORIGIN + "Dashboard/";

                        //login
                    }}>Login</button>}
                    <p>Dont have an account? <a className='btn-link' onClick={() => window.location.href = ORIGIN + "Auth/Signup/"}>Sign Up!</a></p>
                </div>


            </div>
        </>
    )
}

export default App