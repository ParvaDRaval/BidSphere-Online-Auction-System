import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listAuctions } from "../api";
import homeImg from "../assets/home.jpg";
/* eslint-disable react/prop-types */

function AuctionCard({ auction }) {
  const img = auction?.item?.images?.[0] || "";
  // if backend returns a filename, it may need a prefix; assume full URL when it starts with http or /
  const imgSrc = img && (img.startsWith("http") || img.startsWith("/")) ? img : null;
  const title = auction?.title || auction?.item?.name || "Untitled Auction";
  const itemName = auction?.item?.name || "Item";
  const starting = auction?.startingPrice ?? null;
  const endTime = auction?.endTime ? new Date(auction.endTime).toLocaleString() : null;

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="relative">
        {imgSrc ? (
          <img src={imgSrc} alt={itemName} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-500">No image</div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            (() => {
              const s = (auction && auction.status) || "";
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
          }`}>{(auction && auction.status) || "N/A"}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm text-gray-500">{auction?.item?.category || "Category"}</div>
        <div className="font-semibold text-lg text-gray-800">{title}</div>
        <div className="text-sm text-gray-600 mt-1">{itemName}</div>
        {starting != null && <div className="text-sm text-gray-800 mt-2">Starting: ₹{starting}</div>}
        {endTime && <div className="text-xs text-gray-500 mt-1">Ends: {endTime}</div>}
      </div>
    </div>
  );
}

function Home() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchList() {
      setLoading(true);
      try {
        // fetch all auctions (backend defaults to paging) — adjust params as needed
        const res = await listAuctions({ limit: 50 });
        if (!mounted) return;
        // only show upcoming or live auctions
        const all = res?.auctions || [];
        const visible = all.filter((a) => {
          const s = (a && a.status) || "";
          const up = String(s).toUpperCase();
          return up === "LIVE" || up === "UPCOMING";
        });
        setAuctions(visible);
      } catch (err) {
        console.error("listAuctions error:", err);
        if (mounted) setError(err.message || "Failed to load auctions");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchList();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="p-6">
      <img src={homeImg} alt="Home Banner" className="w-full rounded-lg mb-6" />

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {loading ? (
        <div>Loading auctions...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.length > 0 ? (
            auctions.map((a) => (
              <Link
                key={a._id}
                to={`/auction/${a._id}`}
                className="block hover:opacity-95"
              >
                <AuctionCard auction={a} />
              </Link>
            ))
          ) : (
            <>
              <div className="h-48 bg-yellow-600 rounded-lg"></div>
              <div className="h-48 bg-yellow-600 rounded-lg"></div>
              <div className="h-48 bg-yellow-600 rounded-lg"></div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
