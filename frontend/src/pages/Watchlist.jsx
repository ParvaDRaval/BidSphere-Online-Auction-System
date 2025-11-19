import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getWatchlist, removeFromWatchlist, getCurrentUser } from "../api";

function WatchRow({ w, onRemove }) {
  const auction = w.auction || w.auctionId || {};
  const img = auction.item?.images?.[0] || auction.images?.[0] || "";
  const title = auction.title || auction.item?.name || "Untitled Auction";
  const current = auction.currentBid ?? auction.current ?? "-";
  const bidders = auction.totalBids ?? auction.bids ?? 0;
  const endTime = auction.endTime
    ? new Date(auction.endTime).toLocaleString()
    : "—";

  return (
    <div className="border rounded-lg p-3 flex items-center gap-4 bg-white">
      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
        {img ? (
          <img src={img} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold text-lg">{title}</div>
            <div className="text-xs text-gray-500 mt-1">
              {auction.item?.name || ""}
            </div>
          </div>
          <div className="text-xs text-gray-500 text-right">
            <div>
              Bidders:{" "}
              <span className="font-medium text-gray-900">{bidders}</span>
            </div>
            <div className="text-red-600">{endTime}</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-gray-500">Your Bid</div>
            <div className="font-semibold text-blue-700">—</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Current Bid</div>
            <div className="font-semibold text-green-600">₹{current}</div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Link
              to={`/auction/${auction._id || auction.id || w.auctionId}`}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
            >
              View Auction
            </Link>
            <button
              onClick={() => onRemove(auction._id || auction.id || w.auctionId)}
              className="px-3 py-2 bg-red-500 text-white rounded text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Watchlist() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watchlist, setWatchlist] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const me = await getCurrentUser().catch(() => null);
        if (!mounted) return;
        setUser(me?.user || me || null);

        const res = await getWatchlist();
        if (!mounted) return;

        // Normalize different possible response shapes returned by the API
        let list = [];
        if (Array.isArray(res?.watchlist)) list = res.watchlist;
        else if (Array.isArray(res?.data?.watchlist)) list = res.data.watchlist;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res)) list = res;

        // Normalize each watchlist item so the UI can rely on predictable fields
        const normalized = (list || []).map((item) => {
          const w = { ...item };

          // Cases we may receive from the backend:
          // - { auction: { _id: '...', title: '...' } }
          // - { auctionId: '...' }
          // - { auctionId: { _id: '...', title: '...' } }
          // Ensure we always have `auction` as object (when available) and `auctionId` as string
          if (w.auction && typeof w.auction === "object" && w.auction._id) {
            w.auctionId = String(w.auction._id);
          } else if (w.auctionId && typeof w.auctionId === "object" && w.auctionId._id) {
            // backend sometimes embeds auction object into auctionId
            w.auction = w.auctionId;
            w.auctionId = String(w.auctionId._id);
          } else if (w.auction && typeof w.auction === "string" && !w.auctionId) {
            w.auctionId = w.auction;
          }

          // Ensure any nested _id is a string for consistent comparisons
          if (w.auction && typeof w.auction === "object" && w.auction._id) {
            w.auction._id = String(w.auction._id);
          }

          return w;
        });

        setWatchlist(normalized);
      } catch (err) {
        console.error("getWatchlist error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  async function handleRemove(auctionId) {
    if (!window.confirm("Remove this auction from your watchlist?")) return;
    try {
      await removeFromWatchlist(auctionId);
      setWatchlist((s) =>
        s.filter(
          (w) =>
            String(w.auction?._id || w.auctionId || w._id) !== String(auctionId)
        )
      );
    } catch (err) {
      console.error("removeFromWatchlist error:", err);
      alert(err?.message || "Failed to remove watchlist item");
    }
  }

  const filtered = watchlist.filter((w) => {
    if (!q) return true;
    const title = (
      (w.auction?.title || w.auctionId?.title || w.title || "") + ""
    ).toLowerCase();
    return title.includes(q.trim().toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#fdfbf6] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Watchlist</h1>
          <div className="text-sm text-gray-600">
            Showing {watchlist.length} items
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              All the auctions you've added to your watchlist.
            </div>
            <input
              placeholder="Search auction by name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-600">
              Loading watchlist...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              No items in watchlist.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((w, i) => (
                <WatchRow
                  key={w._id || w.auctionId || i}
                  w={w}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
