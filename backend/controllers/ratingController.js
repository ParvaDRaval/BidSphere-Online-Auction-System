import Rating from '../models/Rating.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/* POST /bidsphere/ratings */
export const rateSeller = async (req, res) => {
    try {
        const { auctionId, sellerId, raterId, rating, review } = req.body;

        if (!auctionId || !sellerId || !raterId || !rating) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }

        const existingRating = await Rating.findOne({ auctionId, raterId });
        if (existingRating) {
            return res.status(400).json({
                success: false,
                message: 'You have already rated this seller for this auction'
            });
        }

        const newRating = await Rating.create({
            auctionId,
            sellerId,
            raterId,
            rating,
            review: review || ""
        });

        const agg = await Rating.aggregate([
            { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
            { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
        ]);

        await User.findByIdAndUpdate(sellerId, {
            sellerRating: {
                average: agg[0]?.avg ? Number(agg[0].avg.toFixed(2)) : 0,
                count: agg[0]?.count || 0
            }
        });

        return res.status(201).json({
            success: true,
            message: "Rating submitted successfully",
            rating: newRating
        });

    } catch (error) {
        console.error("Error in rateSeller:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

/* GET /bidsphere/ratings/seller/:sellerId */
export const getSellerRatings = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const query = mongoose.Types.ObjectId.isValid(sellerId)
            ? { sellerId: new mongoose.Types.ObjectId(sellerId) }
            : { sellerId };

        const ratings = await Rating.find(query)
            .populate("raterId", "username profilePhoto")
            .populate("auctionId", "title")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: ratings
        });

    } catch (error) {
        console.error("Error in getSellerRatings:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching ratings"
        });
    }
};
