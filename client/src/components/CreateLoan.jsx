import { useContext, useState } from "react";
import { AuthContext } from "../App";
import axios from "axios";
import "../components/CreateLoan.css"
import { useNavigate } from "react-router-dom";

const CreateLoan = () => {
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("");
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleFormSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!amount || !term) throw "Fill all details!";
      await axios.post(
        "http://localhost:9000/loans/create/",
        { amount, terms: term },
        {
          headers: {
            "Content-Type": "application/json",
            bearertoken: token,
          },
        }
      );
      alert("Loan creation successful!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert(`Can't create the loan!\nError: ${error}`);
    }
  };

  return (

    <>
    <div className="CreateLoan">

    <div class="form-container">
  <form class="form"  onSubmit={handleFormSubmit}>
    <span class="heading">Loan Application Form</span>

    <div class="form-group">

      <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              class="form-input"
            />
      <label> Amount:</label>
    </div>

    <div class="form-group">

      <input
              type="number"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              required
              class="form-input"
            />
      <label>Terms:</label>
    </div>

    <button type="submit">Submit</button>
  
  </form>
</div>

     
    </div>




</>





  );
};

export default CreateLoan;
