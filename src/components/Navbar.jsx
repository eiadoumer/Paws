import {Link} from "react-router"

function Navbar() {
return(

<>
    <header>
        <nav>
            <Link to ="/"> Home</Link>
            <Link to ="/pets"> Browse Pets</Link>
            
        </nav>
    </header>
</>
)
}



export default Navbar