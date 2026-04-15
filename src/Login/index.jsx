import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Cookies from "js-cookie"
import { Navigate } from "react-router-dom"
import "./index.css"

const Login = () => {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [showError, setShowError] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const onSubmitSuccess = jwtToken => {
    Cookies.set("jwt_token", jwtToken, { expires: 30 })
    navigate("/", { replace: true })
  }
 const getToken = Cookies.get("jwt_token")

if (getToken !== undefined) {
  return <Navigate to="/" replace />
}

  const onSubmitFailure = error => {
    setShowError(true)
    setErrorMsg(error)
  }

  const submitForm = async event => {
    event.preventDefault()

    const userDetails = {
        username,
        password,
    }
    console.log(userDetails)

    const url = "https://jobby-rchj.onrender.com/login"

    const options = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    }

    try {
      const response = await fetch(url, options)
      const data = await response.json()
      console.log(data)

      if (response.ok) {
        onSubmitSuccess(data.jwt_token)
      } else {
        onSubmitFailure(data.error_msg)
      }
    } catch {
      setShowError(true)
      setErrorMsg("Something went wrong")
    }

  }

  const registerForm = async event => {
    event.preventDefault()

    const userDetails = {
        username,
        password,
    }

    const url = "https://jobby-rchj.onrender.com/register"

    const options = {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userDetails),
    }

    try {
      const response = await fetch(url, options)
      const data = await response.json()
      console.log(response)

      if (response.ok) {
        setShowSuccess(true)
        setSuccessMsg(data.message)
        setShowError(false)
      } else {
        setShowError(true)
        setErrorMsg(data.message)
        setShowSuccess(false)
      }
    } catch {
      setShowError(true)
      setErrorMsg("Something went wrong")
      setShowSuccess(false)
    }

  }

  return (
    <div className="loginBackGround">
      <form className="formBackGround" onSubmit={submitForm}>
        <img
          className="loginImage"
          src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
          alt="logo"
        />

        <label className="userText">USERNAME</label>
        <input
          className="loginInput"
          type="text"
          value={username}
          placeholder="Username"
          onChange={e => setUsername(e.target.value)}
        />

        <label className="userText">PASSWORD</label>
        <input
          className="loginInput"
          type="password"
          value={password}
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <button className="loginBtn" type="submit">
          Login
        </button>

        <button className="registerBtn" type="button" onClick={registerForm}>
          Register
        </button>

        {showError && <p className="errorMsg">*{errorMsg}</p>}
        {showSuccess && <p className="successMsg">*{successMsg}</p>}
      </form>
    </div>
  )
}

export default Login