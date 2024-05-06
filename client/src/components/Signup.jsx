import React, { useContext, useState } from "react";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const navigate = useNavigate();
  const { setLoggedIn, setToken, setUser } = useContext(AuthContext);

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("hi");
    try {
      e.preventDefault();
      if (!email || !password) throw "Please fill all fields!";
      const user = await axios.post(
        "http://localhost:9000/auth/signup",
        {
          email,
          password,
          name,
        }
      );
      setUser(user.data.user);
      setToken(user.data.token);
      setLoggedIn(true);
      localStorage.setItem("token", user.data.token);
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(`Can't create account!\nError: ${error}`);
    }
  };

  return (
    <>

    <section className=" mt-[-30px] ml-[-90px] bg-emerald-950 border-2 border-black h-[570px] w-[110%]" >
    <center className=" mt-32" >
<form class="form">
    <p class="title">Register </p>
    <p class="message">Signup now and get full access to our app. </p>
        <div class="flex">
        <label>
        <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              class="input"
              required
            />
            
            <span>Firstname</span>
        </label>

      
    </div>  
            
    <label>
    <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              class="input"
              required
            />
      
        <span>Email</span>
    </label> 
        
    <label>
    <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              class="input"
              required
            />
        <span>Password</span>
    </label>
 
    <button
            type="button"
            onClick={(e) => handleSignup(e)}
            class="submit" >
            Signup
          </button>
  
    <div class="signin" >
          <a
            href="/login"
            class="signin"
          >
            Already have an account?
          </a>
        </div>
</form>

</center>
</section>
</>

  );
};

export default Signup;






















