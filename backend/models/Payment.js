import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
    // internal payment id (human-friendly/short)
    paymentId: {
        type: String,
        unique: true,
        default: function() { return `${Date.now().toString(36)}${Math.random().toString(36).slice(2,9)}` }
    },
    // payment id - by default id provided by MongoDB
    provider: { 
        type: String, 
        enum: ['upi', 'cod'], 
        default: 'upi' 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    auctionId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auction',
        required: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['PENDING', 'SUCCESS', 'FAILED'], 
        default: 'PENDING' 
    },
    type: {
        type: String,
        enum: ['REGISTRATION FEES', 'WINNING PAYMENT']
    },  
    upiLink: {
        type: String,
        required: true
    },

    expiry: { 
        type: Date, 
        required: true
    },
    metadata: { 
        type: Object 
    },

    // for admin to verify
    txnId: {
        type: String
    },
    upiAccountName: {
        type: String
    }

}, { timestamps: true });

// Query: find all payments for a specific auction
PaymentSchema.index({ auctionId: 1 });

// Query: find all payments by a specific user
PaymentSchema.index({ userId: 1 });

// Query: find all pending or failed payments quickly
PaymentSchema.index({ status: 1 });

// Query: sort payments by creation time for analytics or dashboard
PaymentSchema.index({ createdAt: -1 });

const Payment = mongoose.model('payment', PaymentSchema);

export default Payment;