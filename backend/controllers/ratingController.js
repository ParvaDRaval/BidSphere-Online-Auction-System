import Rating from '../models/Rating.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const rateSeller = async (req, res) => {
    try {
        const { auctionId, sellerId, raterId, rating, review } = req.body;

        if (!auctionId || !sellerId || !raterId || !rating) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields' 
            });
        }

        if (isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ 
                success: false,
                message: 'Rating must be a number between 1 and 5' 
            });
        }

        const existingRating = await Rating.findOne({ 
            auctionId, 
            raterId 
        });

        if (existingRating) {
            return res.status(400).json({ 
                success: false,
                message: 'You have already rated this seller for this auction' 
            });
        }

        const newRating = new Rating({
            auctionId,
            sellerId,
            raterId,
            rating: Number(rating),
            review: review || ''
        });

        await newRating.save();

        const seller = await User.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ 
                success: false,
                message: 'Seller not found' 
            });
        }

        const allRatings = await Rating.find({ sellerId });
        const totalRatings = allRatings.length;
        const sumRatings = allRatings.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

        seller.sellerRating = {
            average: parseFloat(averageRating.toFixed(2)),
            count: totalRatings
        };

        await seller.save();

        return res.status(201).json({
            success: true,
            message: 'Rating submitted successfully',
            rating: newRating
        });

    } catch (error) {
        console.error('Error in rateSeller:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const getSellerRatings = async (req, res) => {
    try {
        const { sellerId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(sellerId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid seller ID' 
            });
        }

        const ratings = await Rating.find({ sellerId })
            .populate('raterId', 'username profilePhoto')
            .populate('auctionId', 'title')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            data: ratings
        });

    } catch (error) {
        console.error('Error in getSellerRatings:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Error fetching ratings',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};