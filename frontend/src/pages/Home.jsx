import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listAuctions } from "../api";
import ExploreCategories from "./ExploreCategories";
import homeImg from "../assets/home.png";
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
      {imgSrc ? (
        <img src={imgSrc} alt={itemName} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-500">No image</div>
      )}
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
    <div className="w-full">
      {/* Hero banner with overlay */}
      <div className="relative w-full overflow-hidden mb-6 h-[calc(100vh-64px)]">
        <img src={homeImg} alt="Home banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center">
          <div className="max-w-6xl mx-auto px-6 md:text-left text-center text-white h-full flex flex-col justify-center md:pl-12">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 drop-shadow-xl">Where Buyers & Sellers Meet</h1>
            <p className="text-lg md:text-xl mb-6 max-w-xl mx-auto md:mx-0 drop-shadow-md">Discover everything from everyday finds to rare treasures — all in one trusted online auction hub.</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <Link to="/register" className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold shadow-md text-lg">Register Free</Link>
              <Link to="/auctions" className="bg-white text-gray-800 px-6 py-3 rounded-lg font-medium shadow-sm text-lg">Browse Auctions</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Live Auctions */}
      <div className="mb-6 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Featured Live Auctions</h2>
            <p className="text-sm text-gray-600">Don't miss out on these exciting live listings</p>
          </div>
          <div>
            <Link to="/auctions?status=LIVE" className="text-sm text-yellow-600 font-semibold">View All Live Auctions</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {featuredLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`ph-${i}`} className="h-56 bg-gray-200 rounded-lg" />
            ))
          ) : featured.length > 0 ? (
            featured.map((a) => (
              <Link key={a._id} to={`/auction/${a._id}`} className="block hover:opacity-95">
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

      <ExploreCategories />

    </div>
  );
}

export default Home;