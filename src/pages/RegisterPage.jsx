import {Link} from "react-router";
function RegisterPage() {
  return (

    <>
    <main>
        <h1>
            Create your account.
        </h1>

        <form action="/Register" method ="POST">
       
        <label htmlFor="email" >Username:</label>
        <input type="email" name="email" id="email" required/>

        <label htmlFor="password">Password:</label>
        <input type="password" name="password" id="password" required/>

        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input type="password" name="confirmPassword" id="confirmPassword" required/>

        <button type="submit">Register</button>

        <p>Already have an account? <Link to="/login">Login</Link></p>






        
        </form>



    </main>
  
    

    </>

  )
  
  
  
  
}

export default RegisterPage;
