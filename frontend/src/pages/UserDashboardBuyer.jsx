import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWatchlist, getBiddingHistory, getMyDeliveries, getMyPayments, createDelivery } from "../api";
import DashboardSidebar from "../components/DashboardSidebar";
import { useUser } from "../contexts/UserContext";
import { generateInvoicePDF } from "../utils/invoicePDF";
/* eslint-disable react/prop-types */

function StatCard({ title, value, small }) {
  return (
    <div className="bg-white border rounded-lg p-4 flex flex-col justify-between">
      <div className="text-xs text-gray-500">{title}</div>
      <div
        className={`mt-2 ${
          small ? "text-xl" : "text-2xl"
        } font-semibold text-gray-800`}
      >
        {value}
      </div>
    </div>
  );
}

function WatchlistRow({
  title = "Auction Name",
  bid = "₹250",
  bids = 0,
  timeLeft = "—",
  auctionId,
  image = null,
}) {
  const imgSrc = image && (image.startsWith("http") || image.startsWith("/")) ? image : null;
  
  return (
    <div className="flex items-center gap-4 bg-white border rounded p-3 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => {
           if (auctionId) {
             window.location.href = `/auction/${auctionId}`;
           }
         }}>
      <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
        {imgSrc ? (
          <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
            No image
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="font-medium hover:text-blue-600">{title}</div>
        <div className="text-xs text-gray-500 mt-1">
          Current bid <span className="font-semibold text-gray-800">{bid}</span>{" "}
          • Bids {bids}
        </div>
      </div>
      <div className="text-right text-xs text-gray-500">
        <div className="text-sm text-red-600 font-semibold">{timeLeft}</div>
        <div className="mt-2">
          <span className="text-blue-600 text-xs hover:underline">
            View Auction
          </span>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboardBuyer() {
  // top-level state (user comes from context)
  const { user, loading: loadingUser } = useUser() || {};

  const [watchlist, setWatchlist] = useState([]);
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  const [deliveriesSet, setDeliveriesSet] = useState(new Set());
  const [paymentsSuccessSet, setPaymentsSuccessSet] = useState(new Set());
  const [allDeliveries, setAllDeliveries] = useState([]);

  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);
  const [deliveryName, setDeliveryName] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryStreet, setDeliveryStreet] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("");
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState(null);

  // fetch lists (user is provided by context)
  useEffect(() => {
    let mounted = true;
    async function loadLists() {
      try {
        setLoadingLists(true);
        const [wlRes, bhRes, delRes, payRes] = await Promise.allSettled([
          getWatchlist(),
          getBiddingHistory(),
          getMyDeliveries(),
          getMyPayments(),
        ]);

        if (!mounted) return;

        const wl = wlRes.status === "fulfilled" ? (wlRes.value?.watchlist ?? wlRes.value ?? []) : [];
        setWatchlist(Array.isArray(wl) ? wl : []);

        const bh = bhRes.status === "fulfilled" ? (bhRes.value?.history ?? bhRes.value ?? []) : [];
        setBiddingHistory(Array.isArray(bh) ? bh : []);

        if (delRes.status === "fulfilled") {
          const deliveries = delRes.value?.deliveries ?? delRes.value ?? [];
          const arr = Array.isArray(deliveries) ? deliveries : [];
          setAllDeliveries(arr);
          setDeliveriesSet(new Set(arr.map((d) => String(d.auctionId?._id || d.auctionId))));
        }

        if (payRes.status === "fulfilled") {
          const payments = payRes.value?.payments ?? payRes.value ?? [];
          const arr = Array.isArray(payments) ? payments : [];
          const successIds = arr.filter((p) => String(p.status || "").toUpperCase() === "SUCCESS").map((p) => String(p.auctionId || p.auctionId?._id || p.auction));
          setPaymentsSuccessSet(new Set(successIds));
        }
      } catch (err) {
        console.error("list fetch error:", err);
      } finally {
        if (mounted) setLoadingLists(false);
      }
    }

    loadLists();
    return () => (mounted = false);
  }, []);

  const displayName = (user && (user.username || user.name || user.email || user.fullname)) || "First Last";
  const initials = String(displayName).split(" ").map((s) => s[0] || "").slice(0, 2).join("").toUpperCase();

  function openDeliveryForm(auctionId) {
    setSelectedAuctionId(auctionId);
    const existingDelivery = allDeliveries.find((d) => String(d.buyerId?._id || d.buyerId) === String(user?._id));
    if (existingDelivery?.buyerAddress) {
      const a = existingDelivery.buyerAddress || {};
      setDeliveryStreet(a.street || "");
      setDeliveryCity(a.city || "");
      setDeliveryState(a.state || "");
      setDeliveryPostalCode(a.postalCode || "");
      setDeliveryCountry(a.country || "");
      setDeliveryName(a.name || user?.fullname || user?.username || "");
      setDeliveryPhone(a.phone || user?.phone || "");
      setShowConfirmDialog(true);
    } else {
      if (user?.address) {
        setDeliveryStreet(user.address.street || "");
        setDeliveryCity(user.address.city || "");
        setDeliveryState(user.address.state || "");
        setDeliveryPostalCode(user.address.postalCode || "");
        setDeliveryCountry(user.address.country || "");
      }
      setDeliveryName(user?.fullname || user?.username || "");
      setDeliveryPhone(user?.phone || "");
      setShowDeliveryForm(true);
    }
    setDeliveryError(null);
  }

  function editAddress() {
    setShowConfirmDialog(false);
    setShowDeliveryForm(true);
  }

  async function submitDeliveryWithAddress() {
    setDeliveryError(null);
    if (!deliveryName || !deliveryStreet || !deliveryCity || !deliveryState || !deliveryPostalCode || !deliveryCountry) {
      setDeliveryError("Please fill all address fields");
      return;
    }
    try {
      setSavingDelivery(true);
      const payload = {
        auctionId: selectedAuctionId,
        buyerAddress: { name: deliveryName, phone: deliveryPhone, street: deliveryStreet, city: deliveryCity, state: deliveryState, postalCode: deliveryPostalCode, country: deliveryCountry },
      };
      const res = await createDelivery(payload).catch(() => null);
      if (res && (res.success || res.delivery)) {
        const delRes = await getMyDeliveries().catch(() => null);
        const deliveries = delRes?.deliveries ?? delRes ?? [];
        const arr = Array.isArray(deliveries) ? deliveries : [];
        setAllDeliveries(arr);
        setDeliveriesSet(new Set(arr.map((d) => String(d.auctionId?._id || d.auctionId))));
        setShowDeliveryForm(false);
        setShowConfirmDialog(false);
        setDeliveryName(""); setDeliveryPhone(""); setDeliveryStreet(""); setDeliveryCity(""); setDeliveryState(""); setDeliveryPostalCode(""); setDeliveryCountry("");
      } else {
        setDeliveryError(res?.message || "Failed to save");
      }
    } catch (err) {
      console.error(err);
      setDeliveryError(err?.message || "Failed to save");
    } finally {
      setSavingDelivery(false);
    }
  }

  function handleDownloadInvoice(biddingItem) {
    const auctionData = { _id: biddingItem.auctionId?._id || biddingItem._id, title: biddingItem.auctionId?.title || biddingItem.title, description: biddingItem.auctionId?.description || biddingItem.description, endTime: biddingItem.auctionId?.endTime || biddingItem.endTime, final: biddingItem.final || biddingItem.amount, currentBid: biddingItem.auctionId?.currentBid || biddingItem.current, sellerId: biddingItem.auctionId?.sellerId || biddingItem.sellerId, item: biddingItem.auctionId?.item || biddingItem.item };
    const userData = { fullname: user?.fullname || user?.username || displayName, email: user?.email, phone: user?.phone };
    const delivery = allDeliveries.find((d) => String(d.auctionId?._id || d.auctionId) === String(auctionData._id));
    const deliveryData = delivery?.buyerAddress || {};
    generateInvoicePDF(auctionData, userData, deliveryData);
  }

  const activeBids = (Array.isArray(biddingHistory) ? biddingHistory.filter((b) => b.current).length : 0) || 0;
  const totalSpending = (Array.isArray(biddingHistory) ? biddingHistory.reduce((s, b) => s + (b.amount || 0), 0) : 0) || 0;
  const watchlistCount = Array.isArray(watchlist) ? watchlist.length : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar role="buyer" active="dashboard" />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Active Bids" value={<><span className="text-2xl text-green-600">{activeBids}</span><div className="text-xs text-gray-500">Currently bidding</div></>} />
            <StatCard title="Watchlist" value={<><span className="text-2xl text-green-600">{watchlistCount}</span><div className="text-xs text-gray-500">Items saved</div></>} />
            <StatCard title="Unpaid Wins" value={<><span className="text-2xl text-green-600">{(Array.isArray(biddingHistory) ? biddingHistory.filter(b => b.youWon && !paymentsSuccessSet.has(String(b.auctionId?._id || b._id))).length : 0)}</span><div className="text-xs text-gray-500">Awaiting payment</div></>} />
            <StatCard title="Deliveries" value={<><span className="text-2xl text-green-600">{deliveriesSet.size}</span><div className="text-xs text-gray-500">Saved addresses</div></>} />
          </div>

          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Watchlist</h2>
              <div className="text-sm text-blue-600"><Link to="/watchlist">View All</Link></div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {loadingLists ? (
                <div className="text-sm text-gray-500">Loading watchlist...</div>
              ) : !Array.isArray(watchlist) || watchlist.length === 0 ? (
                <div className="text-sm text-gray-500">You have no items in your watchlist.</div>
              ) : (
                watchlist.map((w, i) => {
                  const title = w.auctionId?.title || w.title || w.item?.name || w.name || "Untitled Auction";
                  const bid = w.auctionId?.currentBid || w.currentBid ? `₹${w.auctionId?.currentBid || w.currentBid}` : (w.auctionId?.startingPrice || w.startingPrice ? `₹${w.auctionId?.startingPrice || w.startingPrice}` : "—");
                  const image = w.auctionId?.item?.images?.[0] || w.auctionId?.images?.[0] || w.image || w.item?.images?.[0] || null;
                  return (
                    <WatchlistRow 
                      key={w._id || w.id || i} 
                      title={title} 
                      bid={bid} 
                      bids={w.totalBids || 0} 
                      timeLeft={w.timeLeft || "—"} 
                      auctionId={w.auctionId?._id || w._id || w.id}
                      image={image}
                    />
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Bidding History</h2>
            <div className="space-y-3">
              {loadingLists ? (
                <div className="text-sm text-gray-500">Loading bidding history...</div>
              ) : !Array.isArray(biddingHistory) || biddingHistory.length === 0 ? (
                <div className="text-sm text-gray-500">You have no bidding history yet.</div>
              ) : (
                biddingHistory.map((b, idx) => {
                  const title = b.auctionId?.title || b.title || b.auctionTitle || b.item?.name || "Auction";
                  const image = b.auctionId?.item?.images?.[0] || b.auctionId?.images?.[0] || b.image || b.item?.images?.[0] || null;
                  const imgSrc = image && (image.startsWith("http") || image.startsWith("/")) ? image : null;
                  const auctionId = b.auctionId?._id || b.auctionId || b._id;
                  
                  return (
                    <div key={b._id || b.id || idx} className="bg-gray-50 p-3 rounded border flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => { if (auctionId) window.location.href = `/auction/${auctionId}`; }}>
                      <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {imgSrc ? (
                          <img src={imgSrc} alt={title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium hover:text-blue-600">{title}</div>
                        <div className="text-xs text-gray-500">Your bid: <span className={b.youWon ? "text-green-600" : "text-gray-700"}>{b.amount ? `₹${b.amount}` : b.yourBid ? `₹${b.yourBid}` : "-"}</span>{b.current && <> • Current: ₹{b.current}</>}{b.final && <> • Final: ₹{b.final}</>}</div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div>{b.createdAt ? new Date(b.createdAt).toLocaleString() : b.when || b.time || (b.endedAt ? new Date(b.endedAt).toLocaleString() : "")}</div>
                        <div className="mt-1"><span className="text-blue-600 text-xs hover:underline">View Auction</span></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 text-center"><Link to="/my-bids" className="text-blue-600">View All History</Link></div>
          </div>

        </div>
      </div>
    </div>
  );
}
