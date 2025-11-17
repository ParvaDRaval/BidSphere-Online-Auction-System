import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createRegistrationPayment,
  verifyAuctionPayment,
  getCurrentUser,
  getPayee,
  getAuction,
} from "../api";

export default function PayFees() {
  const { auctionId: routeAuctionId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [auctionId, setAuctionId] = useState(routeAuctionId || "");
  const [amount, setAmount] = useState(0);
  const [recipientVpa, setRecipientVpa] = useState("");
  const [payerVpa, setPayerVpa] = useState("");
  const [payment, setPayment] = useState(null);
  const [upiTxnId, setUpiTxnId] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchUserAndPayee = async () => {
      try {
        const userRes = await getCurrentUser();
        if (mounted) setUser(userRes?.user || null);

        const payeeRes = await getPayee();
        if (mounted) setRecipientVpa(payeeRes?.payeeVpa || "");
      } catch (err) {
        console.error("Error fetching user or payee details", err);
      }
    };

    const fetchAuctionDetails = async () => {
      if (!routeAuctionId) return;
      try {
        const auctionRes = await getAuction(routeAuctionId);
        if (mounted && auctionRes?.auction?.startingPrice) {
          setAmount(auctionRes.auction.startingPrice * 0.01);
        }
      } catch (err) {
        console.error("Error fetching auction details", err);
      }
    };

    fetchUserAndPayee();
    fetchAuctionDetails();

    return () => (mounted = false);
  }, [routeAuctionId]);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to proceed.");
      navigate("/login");
      return;
    }
    if (!auctionId || !payerVpa) {
      alert("Please provide all required details.");
      return;
    }

    try {
      setCreating(true);
      const paymentRes = await createRegistrationPayment(auctionId);
      // backend returns { payment, verifyLink }
      const created = paymentRes?.payment || paymentRes;
      setPayment(created || null);
      if (paymentRes?.verifyLink) {
        // attach verify link for user convenience
        created && (created.verifyLink = paymentRes.verifyLink);
      }
    } catch (err) {
      console.error("Error creating payment", err);
      // postJSON throws the parsed JSON body when status !ok
      // show useful message to user for debugging
      const msg = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
      alert(msg || "Failed to create payment.");
    } finally {
      setCreating(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!payment || !upiTxnId) {
      alert("Please provide payment details for verification.");
      return;
    }

    try {
      const verifyRes = await verifyAuctionPayment(auctionId, payment._id, {
        upiAccountName: payerVpa || "",
        upiTxnId,
      });
      alert(verifyRes?.message || "Payment verified successfully.");
      navigate(`/auction/${auctionId}`);
    } catch (err) {
      console.error("Error verifying payment", err);
      alert("Payment verification failed.");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Pay Participation Fee</h2>

      <form onSubmit={handleCreatePayment} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="text-sm">Auction ID</label>
          <input
            value={auctionId}
            onChange={(e) => setAuctionId(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="text-sm">Amount (INR)</label>
          <input
            type="number"
            value={amount.toFixed(2)}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="text-sm">Your UPI ID</label>
          <input
            value={payerVpa}
            onChange={(e) => setPayerVpa(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="yourupi@bank"
          />
        </div>

        <div>
          <label className="text-sm">Recipient UPI ID</label>
          <input
            value={recipientVpa}
            readOnly
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {creating ? "Creating..." : "Create Payment"}
        </button>
      </form>

      {payment && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Payment Details</h3>
          <p>Payment ID: {payment._id || payment.paymentId}</p>
          <p>
            Amount: ₹{((payment?.amount && Number(payment.amount) > 1000) ? (Number(payment.amount) / 100).toFixed(2) : (payment?.amount ? Number(payment.amount).toFixed(2) : Number(amount).toFixed(2)))}
          </p>
          <p className="mt-1 text-sm">Status: {payment.status || payment.providerStatus || 'PENDING'}</p>
          {payment.upiLink && (
            <div className="mt-2">
              <a href={payment.upiLink} target="_blank" rel="noreferrer" className="text-blue-600">Open in UPI app</a>
            </div>
          )}
          {payment.qrBase64 && (
            <div className="mt-3">
              <img src={payment.qrBase64} alt="UPI QR" className="w-40 h-40 object-contain" />
            </div>
          )}
          {payment.verifyLink && (
            <div className="mt-2 text-xs text-gray-600">Verify link: <a href={payment.verifyLink} target="_blank" rel="noreferrer" className="text-blue-600">Open verify page</a></div>
          )}

          <div className="mt-4">
            <label className="text-sm">UPI Transaction ID</label>
            <input
              value={upiTxnId}
              onChange={(e) => setUpiTxnId(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleVerifyPayment}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
            >
              Verify Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
