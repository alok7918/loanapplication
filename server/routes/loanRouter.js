import { Router } from "express";
import {
    createLoan,
    getLoans,
    repayLoan,
    updateLoan,
    manualrepay,
} from "../controllers/loans.js";
import { verifyLogin } from "../controllers/utils.js";
const loanRouter = Router();

loanRouter.get("/", verifyLogin, getLoans);
loanRouter.post("/create", verifyLogin, createLoan);
loanRouter.patch("/update-status/", verifyLogin, updateLoan);
loanRouter.patch("/repay/", verifyLogin, repayLoan);
loanRouter.patch("/manualrepay/", verifyLogin, manualrepay);

export default loanRouter;


