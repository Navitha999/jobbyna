import "./index.css"
import {Link} from "react-router"
import Header from "../Header"
// import {useNavigate} from "react-router"

const Home=()=>{
   
    return(
        <>
        <div>
            <Header/>
        <div className="backGround">
            <div className="textBox">
                <h1 className="head">Find The Job That Fits Your Life</h1>
                <p className="para">Millions of people are searching for jobs, salary information, company reviwes. Find the job that fits your abilities and potential.</p>
                
                <Link to="/jobs"><button className="findBtn" >Find Job</button></Link>
            </div>
            
        </div>
        </div>
        
        </>
    )
}
export default Home