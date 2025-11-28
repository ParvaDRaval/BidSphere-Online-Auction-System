import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUser, getMyAuctions, deleteAuction } from "../api";
import { toast } from "react-toastify";

function StatCard({ title, value, small, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border rounded-lg p-4 flex flex-col justify-between ${onClick ? 'cursor-pointer hover:shadow' : ''}`}
    >
      <div className="text-xs text-gray-500">{title}</div>
      <div className={`mt-2 ${small ? "text-xl" : "text-2xl"} font-semibold text-gray-800`}>{value}</div>
    </div>
  );
}

import { getStatusColor, getStatusLabel } from "../utils/statusHelpers";

function ListingCard({ id, title = "Auction Name", starting = "₹250", status = "Live", bidders = 0, endsIn = "2h 15m", onDelete, deleting }) {
  const navigate = useNavigate();
  const handleEdit = () => {
    const path = id ? `/edit-auction-draft/${id}` : "/create-auction";
    navigate(path);
  };

  return (
    <div className="bg-white border rounded-md p-4 flex items-center gap-4">
      {id ? (
        <Link to={`/auction/${id}`} className="flex-1 flex items-center gap-4 no-underline text-inherit">
          <div className="w-24 h-16 bg-gray-100 rounded" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">{title}</div>
              <div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                  {getStatusLabel(status)}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1">Starting bid <span className="font-semibold text-gray-800">{starting}</span></div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <div>Bidders: <span className="font-medium text-gray-700">{bidders}</span></div>
              <div>Ends in: <span className="font-medium text-gray-700">{endsIn}</span></div>
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex-1 flex items-center gap-4">
          <div className="w-24 h-16 bg-gray-100 rounded" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-medium">{title}</div>
              <div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
                  {getStatusLabel(status)}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-1">Starting bid <span className="font-semibold text-gray-800">{starting}</span></div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
              <div>Bidders: <span className="font-medium text-gray-700">{bidders}</span></div>
              <div>Ends in: <span className="font-medium text-gray-700">{endsIn}</span></div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={handleEdit}
          className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete && onDelete(id)}
          disabled={deleting}
          className="px-3 py-1 bg-red-50 text-red-700 rounded text-xs font-medium hover:bg-red-100 disabled:opacity-60"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

export default function UserDashboardSeller() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchUser() {
      setLoadingUser(true);
      try {
        const res = await getCurrentUser();
        if (!mounted) return;
        // normalize response shape: backend may return { user } or user directly
        const u = res?.user || res?.data?.user || res?.userData || res || null;
        setUser(u);
      } catch (err) {
        console.error("getCurrentUser error:", err);
      } finally {
        if (mounted) setLoadingUser(false);
      }
    }
    fetchUser();
    return () => (mounted = false);
  }, []);

  const [auctions, setAuctions] = useState([]);
  const [loadingAuctions, setLoadingAuctions] = useState(false);
  const [filterStatus, setFilterStatus] = useState(null);
  const listingsRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function fetchMyAuctions() {
      setLoadingAuctions(true);
      try {
        const res = await getMyAuctions({ limit: 50 });
        if (!mounted) return;
        // backend returns { success, auctions, pagination }
        setAuctions(res?.auctions || []);
      } catch (err) {
        console.error("getMyAuctions error:", err);
      } finally {
        if (mounted) setLoadingAuctions(false);
      }
    }
    fetchMyAuctions();
    return () => (mounted = false);
  }, []);

  // derive a friendly display name with multiple fallbacks
  const localStored = typeof window !== "undefined" ? localStorage.getItem("bidsphere_user") : null;
  let storedUser = null;
  try {
    storedUser = localStored ? JSON.parse(localStored) : null;
  } catch (e) {
    storedUser = null;
  }
  const displayName = (user && (user.name || user.username || user.email)) || (storedUser && (storedUser.name || storedUser.username || storedUser.email)) || "First Last";
  const initials = String(displayName)
    .split(" ")
    .map((s) => s[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // compute stats from auctions
  const totalListings = auctions.length;
  const activeListingCount = auctions.filter(a => a.status === "LIVE").length;
  const totalEarnings = auctions.reduce((sum, a) => {
    // treat ended auctions' currentBid as earnings if present
    if (a.status === "ENDED" && a.currentBid) return sum + Number(a.currentBid || 0);
    return sum;
  }, 0);
  const activeBidders = auctions.reduce((sum, a) => sum + (Number(a.totalParticipants || 0)), 0);
  const endedCount = auctions.filter(a => a.status === "ENDED").length;
  const successfulEnded = auctions.filter(a => a.status === "ENDED" && (a.currentBid && a.currentBid > 0)).length;
  const successRate = endedCount > 0 ? Math.round((successfulEnded / endedCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-3 bg-white border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">{initials || "U"}</div>
            <div>
              <div className="font-semibold">{displayName || (loadingUser ? "Loading..." : "First Last")}</div>
              <div className="text-xs text-gray-500">Active seller</div>
            </div>
          </div>

          <nav className="mt-6">
            <ul className="space-y-2 text-sm">
              <li><Link to="/seller-dashboard" className="block py-2 px-3 rounded bg-blue-50 font-medium">Dashboard</Link></li>
              <li><Link to="/my-listings" className="block py-2 px-3 rounded hover:bg-gray-50">My Listings</Link></li>
              <li>
                <button
                  onClick={() => {
                    setFilterStatus('ENDED');
                    setTimeout(() => listingsRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
                  }}
                  className="w-full text-left py-2 px-3 rounded hover:bg-gray-50"
                >
                  Earnings
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main */}
        <main className="lg:col-span-9 space-y-6">
          {/* Top stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Active Listing" value={<><span className="text-2xl">{activeListingCount}</span><div className="text-xs text-gray-500">{totalListings} total</div></>} />
            <StatCard
              title="Total Earnings"
              value={<><span className="text-2xl">₹{totalEarnings}</span><div className="text-xs text-gray-500">Calculated from ended auctions</div></>}
              small
              onClick={() => {
                setFilterStatus('ENDED');
                // scroll to listings
                setTimeout(() => listingsRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
              }}
            />
            <StatCard title="Active Bidders" value={<><span className="text-2xl">{activeBidders}</span><div className="text-xs text-gray-500">Total participants</div></>} small />
            <StatCard title="Success Rate" value={<><span className="text-2xl">{successRate}%</span><div className="text-xs text-gray-500">Based on ended auctions</div></>} small />
          </div>

          {/* My Listings */}
          <div className="bg-white border rounded-lg p-6" ref={listingsRef}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{filterStatus ? (filterStatus === 'ENDED' ? 'Ended Listings' : `${filterStatus} Listings`) : 'My Listings'}</h2>
              <div className="flex items-center gap-4">
                {filterStatus && (
                  <button onClick={() => setFilterStatus(null)} className="text-sm text-gray-600 hover:underline">Clear Filter</button>
                )}
                <div className="text-sm text-blue-600"><Link to="/my-listings">View All Listings</Link></div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {loadingAuctions ? (
                <div>Loading your listings...</div>
              ) : (filterStatus ? auctions.filter(x => x.status === filterStatus) : auctions).length > 0 ? (
                (filterStatus ? auctions.filter(x => x.status === filterStatus) : auctions).map((a) => (
                  <ListingCard
                    key={a._id}
                    id={a._id}
                    title={a.title || a.item?.name}
                    starting={`₹${a.startingPrice ?? "-"}`}
                    status={a.status}
                    bidders={a.totalBids ?? 0}
                    endsIn={a.endTime ? new Date(a.endTime).toLocaleString() : "-"}
                    onDelete={async (id) => {
                      if (!window.confirm("Are you sure you want to delete this auction? This cannot be undone.")) return;
                      try {
                        setDeletingId(id);
                        await deleteAuction(id);
                        setAuctions((prev) => prev.filter((x) => x._id !== id));
                        toast.success("Auction deleted");
                      } catch (err) {
                        console.error("deleteAuction error:", err);
                        toast.error(err?.message || "Failed to delete auction");
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                    deleting={deletingId === a._id}
                  />
                ))
              ) : (
                <div className="text-sm text-gray-500">You have no listings yet.</div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-40 bg-gray-50 border rounded" />
              <div className="h-40 bg-gray-50 border rounded" />
              <div className="h-40 bg-gray-50 border rounded" />
            </div>
          </div>

          {/* Bottom panels placeholders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="col-span-1 md:col-span-2 bg-white border rounded-lg h-48" />
            <div className="bg-white border rounded-lg h-48" />
          </div>
        </main>
      </div>
    </div>
  );
}
