import Loan from "../models/loan.js"
// getting loan data
export const getLoans = async (req, res) => {
  try {
    let loans;
    if (req.user.user_type === "admin") {
      loans = await Loan.find().populate("user_id");
    } else {
      loans = await Loan.find({ user_id: req.user._id });
    }
    return res.status(200).json({ Loans: loans });
  } catch (error) {
    // console.error(error);
    return res.status(400).json({ error: error });
  }
};

// for generating loan 
export const createLoan = async (req, res) => {
  try {
    const { amount, terms } = req.body;
    const loan = new Loan({
      user_id: req.user._id,
      amount,
      terms,
      repayments: [],
      remainingAmount: amount,
    });

    // Generate scheduled repayments
    const repaymentAmount = (amount / terms).toFixed(2);
    const today = new Date();
    for (let i = 0; i < terms; i++) {
      const repaymentDate = new Date(today);
      repaymentDate.setDate(today.getDate() + 7 * (i + 1));
      loan.repayments.push({
        date: repaymentDate,
        amount: repaymentAmount,
      });
    }

    await loan.save();
    return res.status(201).json({ loan });
  } catch (error) {
    // console.error(error);
    return res.status(400).json({ error });
  }
};


// for update loan
export const updateLoan = async (req, res) => {
  try {
    console.log(req.user.user_type);
    if (req.user.user_type !== "admin") throw "you are not authorized";
    const { id, status } = req.body;
    const loan = await Loan.findByIdAndUpdate(id, { status });
    loan.status = status;
    return res.status(200).json({ msg: "Status updated!", loan });
  } catch (error) {
    // console.error(error);
    return res.status(400).json({ error });
  }
};


// for automatic repay
export const repayLoan = async (req, res) => {
  try {
    const { loanId, installmentId } = req.body;
    const loan = await Loan.findById(loanId);
    const installmentAmount = loan.repayments[0].amount;
    loan.repayments.filter((installment) => {
      if (installment._id == installmentId) installment.status = "paid";
    });
    loan.remainingAmount -= installmentAmount;
    await Loan.findByIdAndUpdate(loanId, loan);
    return res.status(200).json({ msg: "Installment paid" });
  } catch (error) {
    // console.error(error);
    return res.status(400).json({ error });
  }
};


// for manual repay
export const manualrepay = async (req, res) => {
  try {
    const { loanId, installmentId, amount } = req.body;
    const loan = await Loan.findById(loanId);

    // Find the installment to mark as paid
    const installmentToPay = loan.repayments.find(installment => installment._id == installmentId);

    // Mark the installment as paid
    installmentToPay.status = "paid";

    // Reduce the remaining amount of the loan
    loan.remainingAmount -= amount;


    if (loan.remainingAmount === 0) {
      loan.repayments.filter(installment => installment.status !== "paid").forEach(installment => {
        installment.status = "paid"
      })
    }

    // Calculate the new installment amount based on the remaining amount and the same number of terms
    const numberOfRemainingInstallments = loan.repayments.filter(installment => installment.status !== "paid").length;
    const newInstallmentAmount = loan.remainingAmount / numberOfRemainingInstallments;

    // Update the installment amounts for the remaining installments
    loan.repayments.filter(installment => installment.status !== "paid").forEach(installment => {
      installment.amount = newInstallmentAmount;
    });


    // Update the loan in the database
    await Loan.findByIdAndUpdate(loanId, loan);

    return res.status(200).json({ msg: "Installment paid" });

  } catch (error) {
    return res.status(400).json({ error });
  }
};


