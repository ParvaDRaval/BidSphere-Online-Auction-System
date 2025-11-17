import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAuction, placeBid, getCurrentUser, listPayments } from "../api";

function pad(n) {
  return String(n).padStart(2, "0");
}

function AuctionDetails() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [topBids, setTopBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: "--", hours: "--", mins: "--", secs: "--" });
  const intervalRef = useRef(null);
  const [bidAmount, setBidAmount] = useState("");
  const [placingBid, setPlacingBid] = useState(false);
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentCheckLoading, setPaymentCheckLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // PENDING | CAPTURED | VOID | null

  useEffect(() => {
    let mounted = true;
    async function fetchOne() {
      setLoading(true);
      try {
        const res = await getAuction(id);
        if (!mounted) return;
        const a = res?.auction || res || null;
        setAuction(a);
        setTopBids(res?.topBids || []);
      } catch (err) {
        console.error("getAuction error:", err);
        if (mounted) setError(err.message || "Failed to load auction");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) fetchOne();
    return () => (mounted = false);
  }, [id]);

  // fetch current user and check payment status for this auction
  useEffect(() => {
    let mounted = true;
    async function checkPayment() {
      if (!auction?._id) return;
      setPaymentCheckLoading(true);
      try {
        const me = await getCurrentUser().catch(() => null);
        if (!mounted) return;
        const user = me?.user || null;
        setCurrentUser(user);

        if (!user) {
          setHasPaid(false);
          setPaymentStatus(null);
          return;
        }

        // call admin payments list (backend supports filtering)
        const res = await listPayments({ auctionId: auction._id, bidderId: user._id });
        // res.data is array
        const payments = res?.data || [];
        // prefer CAPTURED
        const captured = payments.find((p) => p.status === "CAPTURED");
        if (captured) {
          setHasPaid(true);
          setPaymentStatus("CAPTURED");
        } else {
          const pending = payments.find((p) => p.status === "PENDING");
          if (pending) {
            setHasPaid(false);
            setPaymentStatus("PENDING");
          } else {
            setHasPaid(false);
            setPaymentStatus(null);
          }
        }
      } catch (err) {
        console.error("checkPayment error:", err);
        setHasPaid(false);
        setPaymentStatus(null);
      } finally {
        if (mounted) setPaymentCheckLoading(false);
      }
    }

    checkPayment();
    return () => (mounted = false);
  }, [auction?._id]);

  // countdown: target end OR start when auction is UPCOMING
  useEffect(() => {
    function compute() {
      const isUpcoming = String(auction?.status || "").toUpperCase() === "UPCOMING";
      const targetValue = isUpcoming
        ? (auction?.startTime || auction?.startsAt || auction?.start)
        : (auction?.endTime || auction?.endsAt || auction?.end);
      const target = targetValue ? new Date(targetValue).getTime() : NaN;

      if (!target || isNaN(target)) {
        setTimeLeft({ days: "--", hours: "--", mins: "--", secs: "--" });
        return;
      }
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days: pad(days), hours: pad(hours), mins: pad(mins), secs: pad(secs) });
    }

    compute();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(compute, 1000);
    return () => clearInterval(intervalRef.current);
  }, [auction]);

  if (loading) return <div className="p-6">Loading auction...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!auction) return <div className="p-6">Auction not found.</div>;

  const images = auction?.item?.images || [];
  const seller = auction?.createdBy;
  const displaySellerName = seller?.username || seller?.name || (seller?.email ? seller.email.split("@")[0] : "Unknown");
  const currentPrice = auction?.currentBid && auction.currentBid > 0 ? auction.currentBid : auction?.startingPrice;

  return (
    <div className="p-6 bg-[#f3f3f3] min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: images + details */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold">{auction?.title || auction?.item?.name}</h1>
                <div className="text-sm text-gray-600">{auction?.item?.category} • {auction?.item?.condition}</div>
                <div className="text-xs text-gray-500 mt-1">Created: {new Date(auction.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500">Status</div>
                <div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    (() => {
                      const s = auction?.status || "";
                      switch (String(s).toUpperCase()) {
                        case "YET_TO_BE_VERIFIED":
                          return "bg-yellow-100 text-yellow-800";
                        case "LIVE":
                          return "bg-green-100 text-green-800";
                        case "UPCOMING":
                          return "bg-blue-100 text-blue-800";
                        case "ENDED":
                          return "bg-gray-100 text-gray-800";
                        case "CANCELLED":
                        case "REMOVED":
                          return "bg-red-100 text-red-800";
                        default:
                          return "bg-gray-100 text-gray-800";
                      }
                    })()
                  }`}> {auction?.status || "N/A"} </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-4">
                <div className="w-full h-96 bg-gray-100 rounded overflow-hidden">
                  {images.length > 0 ? (
                    <img src={images[0]} alt={auction?.item?.name || "Auction image"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="mt-4 flex items-center gap-3 overflow-x-auto">
                    {images.slice(0, 6).map((src, i) => (
                      <img key={i} src={src} alt={`thumb-${i}`} className="w-20 h-14 object-cover rounded border" />
                    ))}
                    {images.length > 6 && (
                      <div className="w-20 h-14 bg-gray-800 text-white flex items-center justify-center rounded">+{images.length - 6}</div>
                    )}
                  </div>
                )}

                <div className="mt-6">
                  <div className="grid grid-cols-4 gap-4 text-center text-sm text-gray-600">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-lg">{auction?.totalBids ?? 0}</div>
                      <div className="text-xs">Total Bids</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-lg">{auction?.totalParticipants ?? 0}</div>
                      <div className="text-xs">Bidders</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-lg">{auction?.watching ?? 0}</div>
                      <div className="text-xs">Watching</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-semibold text-lg">₹{auction?.startingPrice ?? "-"}</div>
                      <div className="text-xs">Starting Bid</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-white p-4 rounded border">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 text-sm">{auction?.description || auction?.item?.description || "No description provided."}</p>
                </div>

                {/* removed "What's Included" as requested */}
              </div>

              {/* right area within left column reserved for small panels if needed */}
              <div className="md:col-span-2" />
            </div>
          </div>
        </div>

        {/* Right sidebar: countdown, bid box, activity */}
        <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{(displaySellerName||"U").slice(0,2).toUpperCase()}</div>
                <div>
                  <div className="text-sm font-medium">{displaySellerName}</div>
                  <div className="text-xs text-gray-500">Verified Seller</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-100 p-4 rounded-lg">
              <div className="text-sm text-gray-700 font-semibold">{String(auction?.status || "").toUpperCase() === "UPCOMING" ? "AUCTION STARTS IN" : "AUCTION ENDS IN"}</div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.days}</div>
                  <div className="text-xs">DAYS</div>
                </div>
                <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.hours}</div>
                  <div className="text-xs">HOURS</div>
                </div>
                <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.mins}</div>
                  <div className="text-xs">MINS</div>
                </div>
                <div className="bg-yellow-400 text-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{timeLeft.secs}</div>
                  <div className="text-xs">SECS</div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                {String(auction?.status || "").toUpperCase() === "UPCOMING" ? (
                  <>Starts on { (auction?.startTime || auction?.startsAt || auction?.start) ? new Date(auction.startTime || auction.startsAt || auction.start).toLocaleString() : "—" }</>
                ) : (
                  <>Ends on { (auction?.endTime || auction?.endsAt || auction?.end) ? new Date(auction.endTime || auction.endsAt || auction.end).toLocaleString() : "—" }</>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-500">Current Highest Bid</div>
              <div className="text-xl font-bold mt-1">₹{currentPrice ?? "-"}</div>

              <div className="mt-4">
                <label className="text-sm text-gray-600">Manual Bid Amount</label>
                <input
                  type="number"
                  className="w-full mt-2 p-3 border rounded"
                  placeholder="Enter amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
                <button
                  className="w-full mt-3 bg-yellow-400 text-black font-semibold py-2 rounded disabled:opacity-60"
                  onClick={async () => {
                    // basic validation
                    const val = Number(bidAmount);
                    if (!val || isNaN(val) || val <= 0) {
                      alert("Enter a valid bid amount");
                      return;
                    }

                    const current = Number(currentPrice || 0);
                    const minInc = Number(auction?.minIncrement || 1);
                    const minAllowed = current + minInc;
                    if (val < minAllowed) {
                      alert(`Your bid must be at least ₹${minAllowed}`);
                      return;
                    }

                    try {
                      setPlacingBid(true);
                      await placeBid(auction._id, val);
                      // refresh auction + topBids
                      const res = await getAuction(auction._id);
                      setAuction(res?.auction || res || auction);
                      setTopBids(res?.topBids || []);
                      setBidAmount("");
                      alert("Bid placed successfully");
                    } catch (err) {
                      console.error("placeBid error:", err);
                      alert(err?.message || err?.toString() || "Failed to place bid");
                    } finally {
                      setPlacingBid(false);
                    }
                  }}
                  disabled={placingBid || !hasPaid}
                >
                  {placingBid ? "Placing..." : bidAmount ? `Place Bid - ₹${bidAmount}` : "Place Bid"}
                </button>

                {!paymentCheckLoading && !hasPaid && (
                  <div className="mt-2 text-sm text-red-600">You must pay the participation fee before placing bids. Use the button above to pay.</div>
                )}
                {paymentCheckLoading && (
                  <div className="mt-2 text-sm text-gray-600">Checking payment status...</div>
                )}
                {paymentStatus === "PENDING" && (
                  <div className="mt-2 text-sm text-yellow-700">Payment pending — it will be enabled once captured.</div>
                )}
              </div>

                <div className="mt-4">
                  <button
                    onClick={() => navigate(`/pay-fee/${auction._id}`)}
                    className="w-full mb-2 bg-blue-600 text-white font-semibold py-2 rounded"
                  >
                    Pay Participation Fee
                  </button>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div>Auto-Bid</div>
                    <input type="checkbox" />
                  </div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-3">Live Auction Activity</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {topBids.length === 0 && <div className="text-sm text-gray-500">No activity yet.</div>}
                {topBids.map((b, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">{(b?.bidderId?.username || b?.bidderId?.name || (b?.bidderId?.email || "").split("@")[0] || "U").slice(0,2).toUpperCase()}</div>
                      <div>
                        <div className="text-sm font-medium">{b?.bidderId?.username || b?.bidderId?.name || (b?.bidderId?.email || '').split('@')[0] || 'Anonymous'}</div>
                        <div className="text-xs text-gray-500">{b?.timestamp ? new Date(b.timestamp).toLocaleString() : ''}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold">₹{b?.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default AuctionDetails;
