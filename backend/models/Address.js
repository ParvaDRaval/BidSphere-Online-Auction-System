import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    street: { 
        type: String 
    },
    city: { 
        type: String 
    },
    state: { 
        type: String 
    },
    postalCode: { 
        type: String 
    },
    country: { 
        type: String 
    }
},{ timestamps: true });

const Address = mongoose.model('address', addressSchema);

export default Address;