import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true
    },
    username: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    bio: {
        type: String,
        required: true,
    },
    address: {
      type: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        postalCode: { type: String },
        country: { type: String }
      },
      required: true,
      default: null
    },
    profilePhoto:{
        type : String,
        required: true
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    verificationCode: String,
    
    resetToken: {
      type: String,
      default: null,
    },
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
},{timestamps: true});

const User = mongoose.model('user', userSchema);

export default User;