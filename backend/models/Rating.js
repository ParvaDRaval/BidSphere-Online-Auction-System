import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    raterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// user can rate seller once per auction
ratingSchema.index({ auctionId: 1, raterId: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;