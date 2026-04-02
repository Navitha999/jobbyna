import "./index.css"
import Cookies from "js-cookie"
import { Link, useNavigate } from "react-router-dom"

const Header = () => {
    const navigate = useNavigate()

    const logoutButton = () => {
        Cookies.remove("jwt_token")
        navigate("/login",{replace:true})   // ✅ correct way
    }

    return (
        <div>
            <div className="navbar">
                <img
                    className="headerLogo"
                    src="https://assets.ccbp.in/frontend/react-js/logo-img.png"
                    alt="logo"
                />
                <div className="nav-items">
                    <Link to="/" className="jobs-nav">
                        <p>Home</p>
                    </Link>
                    <Link to="/jobs" className="jobs-nav">
                        <p>Jobs</p>
                    </Link>
                </div>
                <button className="logoutBtn" onClick={logoutButton}>
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Header