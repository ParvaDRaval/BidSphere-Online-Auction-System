import cron from "node-cron";
import Payment from "../models/Payment.js";

export const startPaymentStatusJob = () => {
    // runs in every 24 hrs
    cron.schedule("0 0 * * *", async () => {
        console.log("Running scheduled payment void check...");
        
        try {
            const now = new Date();
            const expired = await Payment.find({
                status: { $in: ["PENDING"] },
                expiry: { $lte: now },
            });

            if (expired.length) console.log(`Found ${expired.length} expired payment(s)`);

            for (const p of expired) {
                try {
                    await Payment.findByIdAndUpdate(p._id, {
                        status: "FAILED",
                        providerStatus: "expired",
                    });
                } catch (err) {
                    console.error("Error marking FAILED for", p.paymentId, err);
                }
            }
            console.log(`[${now.toISOString()}] Payment clean check completed`);
        } catch (err) {
            console.error("Error in scheduled task:", err);
        }
    });
}