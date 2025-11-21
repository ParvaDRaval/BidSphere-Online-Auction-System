import React, { useEffect, useState } from "react";
import { rateSeller, getSellerRatings } from "../api";
import { toast } from "react-toastify";

export default function RatingForm({ auctionId, sellerId, raterId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkIfRated() {
      if (!sellerId || !auctionId || !raterId) return;
      try {
        const res = await getSellerRatings(sellerId);
        if (!mounted) return;
        const data = res?.data || res?.ratings || [];
        const found = (data || []).some((r) => {
          const aid = r.auctionId?._id || r.auctionId;
          const rid = r.raterId?._id || r.raterId;
          return String(aid) === String(auctionId) && String(rid) === String(raterId);
        });
        setAlreadyRated(Boolean(found));
      } catch (err) {
        // ignore - we'll allow submit and surface errors on submit
      }
    }
    checkIfRated();
    return () => (mounted = false);
  }, [sellerId, auctionId, raterId]);

  if (!sellerId || !auctionId || !raterId) return null;
  if (alreadyRated) return (
    <div className="mt-3 p-3 bg-white rounded border text-sm text-gray-700">You have already rated this seller for this auction.</div>
  );

  const handleSubmit = async () => {
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }
    setLoading(true);
    try {
      const payload = { auctionId, sellerId, raterId, rating, review };
      await rateSeller(payload);
      toast.success("Thank you — your rating has been submitted");
      setAlreadyRated(true);
      if (typeof onSubmitted === "function") onSubmitted();
    } catch (err) {
      console.error("rateSeller error:", err);
      const msg = err?.message || (err?.message && typeof err.message === 'string' ? err.message : "Failed to submit rating");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 bg-white p-4 rounded border">
      <div className="text-sm font-semibold mb-2">Rate the Seller</div>
      <div className="flex items-center gap-2 mb-3">
        {Array.from({ length: 5 }).map((_, i) => {
          const val = i + 1;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setRating(val)}
              className={`text-2xl ${val <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
              aria-label={`Rate ${val}`}
            >
              {val <= rating ? '★' : '☆'}
            </button>
          );
        })}
      </div>
      <textarea
        className="w-full p-2 border rounded mb-3"
        rows={3}
        placeholder="Write a short review (optional)"
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </button>
        <button
          onClick={() => { setRating(5); setReview(""); }}
          type="button"
          className="px-4 py-2 border rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
