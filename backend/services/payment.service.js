import Auction from "../models/Auction.js";

export async function generateUpiLink(auctionId, registrationFees) {
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    throw new Error("Auction not found");
  }

  const upiId = "mahekvaghera@oksbi";

  const params = new URLSearchParams({
    pa: upiId,
    am: registrationFees.toString(),
    cu: "INR",
  }); 

  const upiLink = `upi://pay?${params.toString()}`;
  return upiLink;
}

