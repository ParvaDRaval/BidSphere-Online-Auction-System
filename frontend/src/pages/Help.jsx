import React from "react";

export default function Help() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-md p-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            Help Centre
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Getting Started
              </h2>
              <p className="text-gray-600">
                Create an account, verify your email, and start browsing
                auctions. Use filters to find items quickly.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Bidding
              </h2>
              <p className="text-gray-600">
                Place bids on live auctions. You can set auto-bid and add
                auctions to your watchlist. Read bid rules carefully before
                placing high-value bids.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Payments & Delivery
              </h2>
              <p className="text-gray-600">
                Follow instructions on the winner page to complete payment. We
                support UPI and COD where applicable. Track deliveries in your
                account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Still need help?
              </h2>
              <p className="text-gray-600">
                Use the{" "}
                <a href="/feedback" className="text-amber-500 font-medium">
                  Feedback
                </a>{" "}
                form or email support for faster help.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
