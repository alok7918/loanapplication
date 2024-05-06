import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../App";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [loans, setLoans] = useState([]);
  const { user, token, setLoggedIn, setUser } = useContext(AuthContext);
  const [showDetails, updateShowDetails] = useState(null);
  const [manualRepaymentAmount, setManualRepaymentAmount] = useState("");
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

// to get loan data
  const fetchLoans = async () => {
    try {
      const loanData = await axios.get(
        "http://localhost:9000/loans/",
        {
          headers: {
            "Content-Type": "application/json",
            bearertoken: token,
          },
        }
      );
      setLoans(loanData.data.Loans);
    } catch (err) {
      console.error(err);
      alert(`Can't fetch the loans\nError: ${err}`);
    }
  };


  // pagination logic
  const indexOfLastLoan = currentPage * itemsPerPage;
  const indexOfFirstLoan = indexOfLastLoan - itemsPerPage;
  const currentLoans = loans.slice(indexOfFirstLoan, indexOfLastLoan);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


// status update
  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:9000/loans/update-status/`,
        { id, status },
        {
          headers: {
            "Content-Type": "application/json",
            bearertoken: token,
          },
        }
      );
      alert("Updated the loan status");
      fetchLoans();
    } catch (error) {
      console.error(error);
      alert(`Can't update status!\nError:${error}`);
    }
  };

// remaining payment
  const updatePayment = async (loanId, installmentId) => {
    try {
      await axios.patch(
        `http://localhost:9000/loans/repay/`,
        { loanId, installmentId },
        {
          headers: {
            "Content-Type": "application/json",
            bearertoken: token,
          },
        }
      );
      alert("Paid the installment");
      fetchLoans();
    } catch (error) {
      console.error(error);
      alert(`Can't pay installment!\nError:${error}`);
    }
  };

// for manual payment
  const Manualrepay = async (loanId, installmentId, repayamount, totalamount) => {
    try {
      const amount = parseInt(manualRepaymentAmount);
      if (isNaN(amount) || amount < repayamount || amount > totalamount) {
        alert("Please enter a valid repayment amount");
        return;
      }

      await axios.patch(
        `http://localhost:9000/loans/manualrepay/`,
        { loanId, installmentId, amount, totalamount },
        {
          headers: {
            "Content-Type": "application/json",
            bearertoken: token,
          },
        }
      );

      fetchLoans();
      setManualRepaymentAmount("");

    } catch (error) {
      console.error(error);
      alert(`Can't process manual repayment!\nError:${error}`);
    }
  };

  // for logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  // for regulary updating loan data
  useEffect(() => {
    fetchLoans();
  }, []);



  return (
    <>
      <div className="container mx-auto p-4">
        {user && user.user_type === "admin" ? (
          <h3 className="text-2xl font-bold"  >Admin panel</h3>
        ) : (
          <div>
            {user && <h3> Profile : {user.name}</h3>}
          </div>
        )}
        {currentLoans.length ? (
          <>
            <table className="min-w-full bg-white border border-gray-300 mt-4">
              <thead className="border-b-2 border-black">
                <tr>
                  {user.user_type === "admin" && <th>User Id</th>}
                  {user.user_type === "admin" && <th>Name</th>}
                  {user.user_type === "admin" && <th>Email</th>}
                  <th>Amount</th>
                  <th>Terms</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                  <th>Outstandings</th>
                </tr>
              </thead>
              <tbody>
                {currentLoans.map((loan, idx) => (
                  <tr key={idx}>
                    {user.user_type === "admin" && <td>{loan.user_id._id}</td>}
                    {user.user_type === "admin" && <td>{loan.user_id.name}</td>}
                    {user.user_type === "admin" && (
                      <td>{loan.user_id.email}</td>
                    )}
                    <td>{loan.amount}</td>
                    <td>{loan.terms}</td>
                    <td>{loan.status}</td>
                    <td>{loan.createdAt.slice(0, 10)}</td>
                    <td>
                      {user &&
                        user.user_type === "admin" &&
                        loan.status === "pending" ? (
                        <>
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                            onClick={() => updateStatus(loan._id, "accepted")}
                          >
                            Accept
                          </button>
                          <button
                            className="bg-red-500 text-white px-4 py-2 rounded"
                            onClick={() => updateStatus(loan._id, "rejected")}
                          >
                            Reject
                          </button>
                        </>
                      ) : loan.status !== "rejected" ? (
                        <>
                          <button
                            className="bg-blue-500 text-white px-4 py-2 rounded"
                            onClick={() => updateShowDetails(loan._id)}
                          >
                            View Details
                          </button>{" "}
                        </>
                      ) : (
                        <button
                          className="bg-gray-300 text-gray-600 px-4 py-2 rounded"
                          disabled
                        >
                          Rejected
                        </button>
                      )}
                    </td>
                    {loan.remainingAmount === 0 ? <td>paid</td> : <td>pending</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>No loans found!</p>
        )}
      </div>
      <div className="container mx-auto p-4">
        {loans.length ? (
          <>
            <table className="min-w-full bg-white border border-gray-300 mt-4">
              <tbody >
                {loans.map((loan, idx) => (
                  <>
                    {showDetails === loan._id && (
                      <>
                        <div>
                          <table className="ms-10 mt-3 mb-10 float-left">
                            {loan.repayments && (
                              <>
                                <tr className=" border-2 border-black">
                                  <div className="flex">
                                    <div className=" w-40 "><th>Amount</th></div>
                                    <div className=" w-40 "><th>Due</th></div>
                                    <div className=" w-40 "><th>Status</th></div>
                                    <div className=" w-40 "><th>Action</th></div>
                                    <div className=" w-40 "><th>Manual Repayment</th></div> {/* Corrected column heading */}
                                  </div>
                                </tr>
                                {loan.repayments.map((repay) => (
                                  <tr border-2 border-black key={repay._id}>
                                    <div className="flex border-2 border-black">
                                      <div className=" w-40"><td>{repay.amount}</td></div>
                                      <div className=" w-40"><td>{repay.date.slice(0, 15)}</td></div>
                                      <div className=" w-40"><td >{repay.status}</td></div>
                                      <div className=" w-40"><td>
                                        {repay.status === "pending" ? (
                                          <button
                                            disabled={loan.status !== "accepted"}
                                            onClick={() => {
                                              updatePayment(loan._id, repay._id);
                                            }}
                                          >
                                            Repay
                                          </button>
                                        ) : (
                                          <button disabled>Paid </button>
                                        )}
                                      </td>
                                      </div>
                                      <div className=" w-72"><td>
                                        {repay.status === "pending" ? (
                                          <>
                                            <label>Repayment Amount:</label>
                                            <input
                                              type="number"
                                              // Use repay._id as a key for the state variable
                                              className=" border-x-2 border-y-2"
                                              onChange={(e) => setManualRepaymentAmount(e.target.value)}
                                            />
                                            <button
                                            className=" mt-5"
                                              disabled={loan.status !== "accepted"}
                                              onClick={() => {
                                                Manualrepay(loan._id, repay._id, repay.amount, loan.amount);
                                              }}>Repay manually</button>
                                          </>) : (
                                          <button disabled>Paid</button>
                                        )}
                                      </td>
                                      </div>
                                    </div>
                                  </tr>
                                ))}
                              </>
                            )}
                            <div className=" mt-5 border-red-200 border-2">
                              <span className="mt-10 ms-[-30px] text-xl font-semibold">Total Amount:{loan.amount}</span>
                              <span className=" ms-32 text-xl font-semibold">Remaining Amount:{loan.remainingAmount}</span>
                            </div>
                          </table>
                        </div>
                      </>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <></>
        )}
        <div className="mt-4  flex justify-center">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1} >
            Previous
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastLoan >= loans.length}
          >
            Next
          </button>
          <a href="/createLoan" className="text-blue-500 mt-4">
            <button className="button1" >Apply for loan </button>
          </a>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded mt-4"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
