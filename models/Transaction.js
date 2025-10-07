// /models/Transaction.js
import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    service: { type: String },
    amount: { type: Number, required: true },
    payment_method: { type: String, default: "Easypaisa" },
    transaction_id: { type: String },
    phone: { type: String },
    email: { type: String },
    name: { type: String },
    cnic: { type: String },
    description: { type: String },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    secretWord: { type: String, required: true }, // 🔐 to identify which client portal it belongs to
  },
  { timestamps: true }
);

// Prevent model overwrite error in Next.js hot reload
export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
