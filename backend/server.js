import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import path from "path";

// express app
const app = express();
app.set("trust proxy", true);

// CORS configuration for production
const allowedOrigin = process.env.CLIENT_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000";
const localhostRegex = /^http:\/\/localhost:\d+$/;
const vercelPreview = /^https:\/\/bid-sphere-online-auction-s.*\.vercel\.app$/;
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / server-to-server
    if (origin === allowedOrigin || localhostRegex.test(origin) || vercelPreview.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS: " + origin));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  credentials: true
};

app.use(cors(corsOptions));

//connect to db
import connectDB from "./services/db.js";
import { startAuctionStatusUpdater } from "./jobs/auctionStatusUpdater.js";

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const cronPattern = process.env.AUCTION_STATUS_UPDATER_CRON || "*/1 * * * *";
    startAuctionStatusUpdater({ 
      cronPattern,
      runOnStart: true 
    });
  })
  .catch((err) => {
    console.error("Database connection failed");
  });

import {startPaymentStatusJob} from "./jobs/paymentStatusJob.js";
import {startRegistrationStatusJob} from "./jobs/au-registrationStatusJob.js";

startPaymentStatusJob();
startRegistrationStatusJob();

//middlewares
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));      
app.use(cookieParser());      
// serve uploaded files from /uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
import { restrictToLoggedinUserOnly, checkAuth } from "./middleware/authMiddleware.js"; 
import { restrictAdminIP } from "./middleware/adminMiddleware.js";

// home page
app.get ("/", restrictToLoggedinUserOnly, (req, res) => res.send("BidSphere Online Auction System") );

// User Route
import authRoutes from "./routes/authRoutes.js";
app.use("/bidsphere/user", authRoutes);

// Admin Route
import adminRoutes from "./routes/adminRoutes.js";
app.use("/bidsphere/admin", (req, res, next) => {
  if (!process.env.ADMIN_IP) return next();
  return restrictAdminIP(req, res, next);
}, adminRoutes)

// Bid Route
import bidRoutes from "./routes/bidRoutes.js";
app.use("/BidSphere/auctions/:auctionId/bid", bidRoutes);

// Auction Route
import auctionRoutes from "./routes/auctionRoutes.js";
app.use("/bidsphere/auctions", auctionRoutes);


// Payment Routes
import paymentRoutes from "./routes/paymentRoutes.js";
app.use("/bidsphere/auctions", paymentRoutes);

// Delivery Routes
import deliveryRoutes from "./routes/deliveryRoutes.js";
app.use("/bidsphere/delivery", deliveryRoutes);

export default app;