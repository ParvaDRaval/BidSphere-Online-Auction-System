import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser, getWatchlist, getBiddingHistory, getMyDeliveries, getMyPayments, createDelivery } from "../api";
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
}) {
  return (
    <div className="flex items-center gap-4 bg-white border rounded p-3 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => {
           if (auctionId) {
             window.location.href = `/auction/${auctionId}`;
           }
         }}>
      <div className="w-16 h-12 bg-gray-100 rounded" />
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
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const [watchlist, setWatchlist] = useState([]);
  const [biddingHistory, setBiddingHistory] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingUser(true);
      try {
        const res = await getCurrentUser().catch(() => null);
        if (!mounted) return;
        const u = res?.user || res || null;
        setUser(u);
      } catch (err) {
        console.error("getCurrentUser error:", err);
      } finally {
        if (mounted) setLoadingUser(false);
      }

      try {
        setLoadingLists(true);
        const [wlRes, bhRes, delRes, payRes] = await Promise.allSettled([
          getWatchlist(),
          getBiddingHistory(),
          getMyDeliveries(),
          getMyPayments(),
        ]);
        if (!mounted) return;
        if (wlRes.status === "fulfilled")
          setWatchlist(wlRes.value?.watchlist || []);
        if (bhRes.status === "fulfilled")
          setBiddingHistory(bhRes.value?.history || []);
        if (delRes.status === "fulfilled") {
          const deliveries = delRes.value?.deliveries || delRes.value || [];
          // build a set of auction ids that have deliveries
          const set = new Set((deliveries || []).map(d => String(d.auctionId?._id || d.auctionId)));
          setDeliveriesSet(set);
          setAllDeliveries(deliveries || []);
        }
        if (payRes.status === "fulfilled") {
          const payments = payRes.value?.payments || payRes.value || [];
          // build a set of auction ids for payments that are SUCCESS
          const paySet = new Set((payments || []).filter(p => (p.status || '').toUpperCase() === 'SUCCESS').map(p => String(p.auctionId)));
          setPaymentsSuccessSet(paySet);
        }
      } catch (err) {
        console.error("list fetch error:", err);
      } finally {
        if (mounted) setLoadingLists(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const [deliveriesSet, setDeliveriesSet] = useState(new Set());
  const [paymentsSuccessSet, setPaymentsSuccessSet] = useState(new Set());
  const [allDeliveries, setAllDeliveries] = useState([]);

  const handleDownloadInvoice = (biddingItem) => {
    const auctionData = {
      _id: biddingItem.auctionId?._id || biddingItem._id,
      title: biddingItem.auctionId?.title || biddingItem.title,
      description: biddingItem.auctionId?.description || biddingItem.description,
      endTime: biddingItem.auctionId?.endTime || biddingItem.endTime,
      final: biddingItem.final || biddingItem.amount,
      currentBid: biddingItem.auctionId?.currentBid || biddingItem.current,
      sellerId: biddingItem.auctionId?.sellerId || biddingItem.sellerId,
      item: biddingItem.auctionId?.item || biddingItem.item
    };

    const userData = {
      fullname: user?.fullname || user?.username,
      email: user?.email,
      phone: user?.phone
    };

    const deliveryData = allDeliveries.find(d => 
      String(d.auctionId?._id || d.auctionId) === String(auctionData._id)
    )?.buyerAddress || {};

    generateInvoicePDF(auctionData, userData, deliveryData);
  };

  // Delivery form states
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryStreet, setDeliveryStreet] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryState, setDeliveryState] = useState('');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState('');
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [deliveryError, setDeliveryError] = useState(null);

  const displayName =
    (user && (user.username || user.name || user.email)) || "First Last";
  const initials = String(displayName)
    .split(" ")
    .map((s) => s[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function openDeliveryForm(auctionId) {
    setSelectedAuctionId(auctionId);
    
    // Check if user already has a delivery address saved
    const existingDelivery = allDeliveries.find(d => d.buyerId?._id === user?._id || d.buyerId === user?._id);
    
    if (existingDelivery?.buyerAddress) {
      // Show confirmation dialog with existing address
      setDeliveryStreet(existingDelivery.buyerAddress.street || '');
      setDeliveryCity(existingDelivery.buyerAddress.city || '');
      setDeliveryState(existingDelivery.buyerAddress.state || '');
      setDeliveryPostalCode(existingDelivery.buyerAddress.postalCode || '');
      setDeliveryCountry(existingDelivery.buyerAddress.country || '');
      setDeliveryName(existingDelivery.buyerAddress.name || user?.fullname || user?.username || '');
      setDeliveryPhone(existingDelivery.buyerAddress.phone || user?.phone || '');
      setShowConfirmDialog(true);
    } else {
      // Show form to enter new address
      if (user?.address) {
        setDeliveryStreet(user.address.street || '');
        setDeliveryCity(user.address.city || '');
        setDeliveryState(user.address.state || '');
        setDeliveryPostalCode(user.address.postalCode || '');
        setDeliveryCountry(user.address.country || '');
        setDeliveryName(user.fullname || user.username || '');
      }
      if (user?.phone) setDeliveryPhone(user.phone);
      setShowDeliveryForm(true);
    }
    setDeliveryError(null);
  }

  function confirmExistingAddress() {
    // Use the existing address without re-entering
    submitDeliveryWithAddress();
  }

  function editAddress() {
    setShowConfirmDialog(false);
    setShowDeliveryForm(true);
  }

  async function submitDeliveryWithAddress() {
    setDeliveryError(null);
    if (!deliveryName || !deliveryStreet || !deliveryCity || !deliveryState || !deliveryPostalCode || !deliveryCountry) {
      return setDeliveryError('Please fill all address fields');
    }
    try {
      setSavingDelivery(true);
      const payload = {
        auctionId: selectedAuctionId,
        buyerAddress: {
          name: deliveryName,
          phone: deliveryPhone,
          street: deliveryStreet,
          city: deliveryCity,
          state: deliveryState,
          postalCode: deliveryPostalCode,
          country: deliveryCountry
        }
      };
      const res = await createDelivery(payload);
      if (res && (res.success || res.delivery)) {
        // Refresh deliveries list
        const delRes = await getMyDeliveries().catch(() => null);
        if (delRes?.deliveries) {
          const set = new Set((delRes.deliveries || []).map(d => String(d.auctionId?._id || d.auctionId)));
          setDeliveriesSet(set);
          setAllDeliveries(delRes.deliveries || []);
        }
        setShowDeliveryForm(false);
        setShowConfirmDialog(false);
        // Reset form
        setDeliveryName('');
        setDeliveryPhone('');
        setDeliveryStreet('');
        setDeliveryCity('');
        setDeliveryState('');
        setDeliveryPostalCode('');
        setDeliveryCountry('');
      } else {
        setDeliveryError(res?.message || 'Failed to save');
      }
    } catch (err) {
      console.error(err);
      setDeliveryError(err?.message || 'Failed to save');
    } finally {
      setSavingDelivery(false);
    }
  }

  const activeBids = 0;
  const totalSpending = 0;
  const watchlistCount = watchlist.length;
  const wonAuctions = 0;

  return (
    <div className="min-h-screen bg-[#fdfbf6]">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
              {initials || "U"}
            </div>
            <div>
              <div className="font-semibold">
                {displayName || (loadingUser ? "Loading..." : "First Last")}
              </div>
              <div className="text-xs text-gray-500">Active bidder</div>
            </div>
          </div>

          <nav className="mt-6">
            <ul className="space-y-2 text-sm">
             <li>
              <Link 
                 to="/buyer-dashboard"
                  className="block py-2 px-3 rounded bg-green-50 font-medium"
                  >
                    Dashboard
                  </Link>
             </li>
              <li>
                <Link
                  to="/my-bids"
                  className="block py-2 px-3 rounded hover:bg-gray-50"
                >
                  My Bids
                </Link>
              </li>
              <li>
                <Link
                  to="/watchlist"
                  className="block py-2 px-3 rounded hover:bg-gray-50"
                >
                  Watchlist
                </Link>
              </li>
             
            </ul>
          </nav>
        </aside>

        <main className="lg:col-span-9 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Active Bids"
              value={
                <>
                  <span className="text-2xl">{activeBids}</span>
                  <div className="text-xs text-gray-500">Across auctions</div>
                </>
              }
            />
            <StatCard
              title="Total Spending"
              value={
                <>
                  <span className="text-2xl">₹{totalSpending}</span>
                  <div className="text-xs text-gray-500">This month</div>
                </>
              }
              small
            />
            <StatCard
              title="Watchlist Items"
              value={
                <>
                  <span className="text-2xl">{watchlistCount}</span>
                  <div className="text-xs text-gray-500">Items saved</div>
                </>
              }
              small
            />
          </div>

          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">My Watchlist</h2>
              <div className="text-sm text-blue-600">
                <Link to="/watchlist">View All</Link>
              </div>
            </div>

            <div className="space-y-3">
              {loadingLists ? (
                <div className="text-sm text-gray-500">
                  Loading watchlist...
                </div>
              ) : watchlist.length === 0 ? (
                <div className="text-sm text-gray-500">
                  You have no items in your watchlist.
                </div>
              ) : (
                watchlist.map((w, i) => (
                  <WatchlistRow
                    key={w._id || w.id || i}
                    title={
                      w.auctionId?.title || w.title || w.auctionId?.item?.name || w.item?.name || w.name || "Untitled Auction"
                    }
                    bid={
                      w.auctionId?.currentBid || w.currentBid
                        ? `₹${w.auctionId?.currentBid || w.currentBid}`
                        : w.auctionId?.startingPrice || w.startingPrice
                        ? `₹${w.auctionId?.startingPrice || w.startingPrice}`
                        : "—"
                    }
                    bids={w.auctionId?.totalBids ?? w.auctionId?.bids ?? w.totalBids ?? w.bids ?? 0}
                    timeLeft={
                      w.endsIn ||
                      w.timeLeft ||
                      (w.auctionId?.endTime || w.endTime ? new Date(w.auctionId?.endTime || w.endTime).toLocaleString() : "")
                    }
                    auctionId={w.auctionId?._id || w._id || w.id}
                  />
                ))
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Bidding History</h2>
            <div className="space-y-3">
              {loadingLists ? (
                <div className="text-sm text-gray-500">
                  Loading bidding history...
                </div>
              ) : biddingHistory.length === 0 ? (
                <div className="text-sm text-gray-500">
                  You have no bidding history yet.
                </div>
              ) : (
                biddingHistory.map((b, idx) => (
                  <div
                    key={b._id || b.id || idx}
                    className="bg-gray-50 p-3 rounded border flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      const auctionId = b.auctionId?._id || b.auctionId || b._id;
                      if (auctionId) {
                        window.location.href = `/auction/${auctionId}`;
                      }
                    }}
                  >
                    <div className="w-16 h-12 bg-gray-100 rounded" />
                    <div className="flex-1">
                      <div className="font-medium hover:text-blue-600">
                        {b.auctionId?.title ||
                          b.title ||
                          b.auctionTitle ||
                          b.item?.name ||
                          "Auction"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Your bid:{" "}
                        <span
                          className={
                            b.youWon ? "text-green-600" : "text-gray-700"
                          }
                        >
                          {b.amount
                            ? `₹${b.amount}`
                            : b.yourBid
                            ? `₹${b.yourBid}`
                            : "-"}
                        </span>
                        {b.current && <> • Current: ₹{b.current}</>}
                        {b.final && <> • Final: ₹{b.final}</>}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <div>
                        {b.createdAt
                          ? new Date(b.createdAt).toLocaleString()
                          : b.when ||
                            b.time ||
                            (b.endedAt
                              ? new Date(b.endedAt).toLocaleString()
                              : "")}
                      </div>
                      <div className="mt-1">
                        <span className="text-blue-600 text-xs hover:underline">
                          View Auction
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 text-center">
              <Link to="/my-bids" className="text-blue-600">
                View All History
              </Link>
            </div>
          </div>

          {/* Unpaid Wins: show auctions the user won but may not have paid yet */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Unpaid Wins</h2>
            <div className="space-y-3">
              {loadingLists ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                  (biddingHistory || [])
                  .filter((b) => b.youWon)
                  .filter((b) => (b.auctionId?.status || '').toUpperCase() === 'ENDED')
                  // exclude auctions that already have a successful payment
                  .filter((b) => {
                    const aid = String(b.auctionId?._id || b._id || '');
                    return !paymentsSuccessSet.has(aid);
                  })
                  .map((b, idx) => {
                    const aid = String(b.auctionId?._id || b._id || '');
                    const hasDelivery = deliveriesSet.has(aid);
                    const hasPaymentSuccess = paymentsSuccessSet.has(aid);
                    return (
                      <div key={b._id || b.auctionId?._id || idx} className="bg-gray-50 p-3 rounded border flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                           onClick={() => {
                             const auctionId = b.auctionId?._id || b._id;
                             if (auctionId) {
                               window.location.href = `/auction/${auctionId}`;
                             }
                           }}>
                        <div>
                          <div className="font-medium hover:text-blue-600">{b.auctionId?.title || b.title || 'Auction'}</div>
                          <div className="text-xs text-gray-500">Final: {b.final ? `₹${b.final}` : b.amount ? `₹${b.amount}` : b.current ? `₹${b.current}` : '-'}</div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {hasDelivery ? (
                            <Link to={`/delivery`} className="px-3 py-2 bg-gray-200 text-gray-800 rounded text-sm">Delivery Saved</Link>
                          ) : hasPaymentSuccess ? (
                            <Link to={`/delivery/create/${aid}`} className="px-3 py-2 bg-orange-500 text-white rounded text-sm">Delivery Pending</Link>
                          ) : (
                            <Link to={`/auction/${b.auctionId?._id || b._id}/pay`} className="px-3 py-2 bg-green-600 text-white rounded text-sm">Pay Now</Link>
                          )}
                          <Link to={`/auction/${b.auctionId?._id || b._id}`} className="text-sm text-blue-600">View</Link>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Deliveries</h2>
            <div className="space-y-3">
              {loadingLists ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                  (biddingHistory || [])
                  .filter((b) => b.youWon)
                  .filter((b) => (b.auctionId?.status || '').toUpperCase() === 'ENDED')
                  .filter((b) => {
                    const aid = String(b.auctionId?._id || b._id || '');
                    return paymentsSuccessSet.has(aid);
                  })
                  .map((b, idx) => {
                    const aid = String(b.auctionId?._id || b._id || '');
                    const hasDelivery = deliveriesSet.has(aid);
                    return (
                      <div key={b._id || b.auctionId?._id || idx} className="bg-gray-50 p-3 rounded border flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                           onClick={() => {
                             const auctionId = b.auctionId?._id || b._id;
                             if (auctionId) {
                               window.location.href = `/auction/${auctionId}`;
                             }
                           }}>
                        <div>
                          <div className="font-medium hover:text-blue-600">{b.auctionId?.title || b.title || 'Auction'}</div>
                          <div className="text-xs text-gray-500">Final: {b.final ? `₹${b.final}` : b.amount ? `₹${b.amount}` : b.current ? `₹${b.current}` : '-'}</div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {hasDelivery ? (
                            <>
                              <span className="px-3 py-2 bg-green-100 text-green-800 rounded text-sm">Delivery Saved</span>
                              <button 
                                onClick={() => handleDownloadInvoice(b)}
                                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                title="Download Invoice PDF"
                              >
                                📄 Invoice
                              </button>
                            </>
                          ) : (
                            <button onClick={() => openDeliveryForm(aid)} className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Add Delivery Address</button>
                          )}
                          <Link to={`/auction/${b.auctionId?._id || b._id}`} className="text-sm text-blue-600">View</Link>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </div>

          {showConfirmDialog && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Confirm Delivery Address</h2>
              <p className="text-gray-600 mb-4">Is this the address where you want the delivery?</p>
              <div className="bg-gray-50 p-4 rounded mb-4 space-y-2">
                <div><strong>Name:</strong> {deliveryName}</div>
                <div><strong>Phone:</strong> {deliveryPhone}</div>
                <div><strong>Street:</strong> {deliveryStreet}</div>
                <div><strong>City:</strong> {deliveryCity}</div>
                <div><strong>State:</strong> {deliveryState}</div>
                <div><strong>Postal Code:</strong> {deliveryPostalCode}</div>
                <div><strong>Country:</strong> {deliveryCountry}</div>
              </div>
              {deliveryError && <div className="text-red-600 mb-3">{deliveryError}</div>}
              <div className="flex items-center gap-2">
                <button
                  onClick={confirmExistingAddress}
                  disabled={savingDelivery}
                  className={`px-4 py-2 rounded text-white ${savingDelivery ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {savingDelivery ? 'Confirming...' : 'Yes, Confirm'}
                </button>
                <button
                  onClick={editAddress}
                  className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-50"
                >
                  No, Edit Address
                </button>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showDeliveryForm && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Add Delivery Address</h2>
              {deliveryError && <div className="text-red-600 mb-3">{deliveryError}</div>}
              <form onSubmit={(e) => { e.preventDefault(); submitDeliveryWithAddress(); }} className="space-y-3">
                <input
                  value={deliveryName}
                  onChange={(e) => setDeliveryName(e.target.value)}
                  placeholder="Full name"
                  className="w-full p-2 border rounded"
                />
                <input
                  value={deliveryPhone}
                  onChange={(e) => setDeliveryPhone(e.target.value)}
                  placeholder="Phone"
                  className="w-full p-2 border rounded"
                />
                <input
                  value={deliveryStreet}
                  onChange={(e) => setDeliveryStreet(e.target.value)}
                  placeholder="Street address"
                  className="w-full p-2 border rounded"
                />
                <input
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  placeholder="City"
                  className="w-full p-2 border rounded"
                />
                <input
                  value={deliveryState}
                  onChange={(e) => setDeliveryState(e.target.value)}
                  placeholder="State"
                  className="w-full p-2 border rounded"
                />
                <input
                  value={deliveryPostalCode}
                  onChange={(e) => setDeliveryPostalCode(e.target.value)}
                  placeholder="Postal code"
                  className="w-full p-2 border rounded"
                />
                <input
                  value={deliveryCountry}
                  onChange={(e) => setDeliveryCountry(e.target.value)}
                  placeholder="Country"
                  className="w-full p-2 border rounded"
                />
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={savingDelivery}
                    className={`px-4 py-2 rounded text-white ${savingDelivery ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {savingDelivery ? 'Saving...' : 'Save Delivery Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeliveryForm(false);
                      setShowConfirmDialog(false);
                    }}
                    className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Trending Auctions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-40 bg-gray-100 rounded border" />
              <div className="h-40 bg-gray-100 rounded border" />
              <div className="h-40 bg-gray-100 rounded border" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
