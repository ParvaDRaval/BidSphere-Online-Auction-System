import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createUpiOrder, getPaymentStatus, verifyPayment, getCurrentUser, getPayee } from "../api";

// Fixed participation fee in INR
const FIXED_FEE_INR = 100;
const FIXED_FEE_PAISE = FIXED_FEE_INR * 100;

export default function PayFees() {
  const { auctionId: routeAuctionId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [auctionId, setAuctionId] = useState(routeAuctionId || "");
  // amount is fixed to 100 INR
  const [amount] = useState(FIXED_FEE_INR);
  const [recipientVpa, setRecipientVpa] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [payerVpa, setPayerVpa] = useState("");
  const [note, setNote] = useState("");
  const [creating, setCreating] = useState(false);
  const [payment, setPayment] = useState(null);
  const [polling, setPolling] = useState(false);
  const pollRef = useRef(null);
  const [upiTxnId, setUpiTxnId] = useState("");

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((res) => {
        if (!mounted) return;
        setUser(res?.user || null);
      })
      .catch(() => setUser(null));
    // fetch configured recipient (site) VPA from backend env
    getPayee()
      .then((res) => {
        if (!mounted) return;
        if (res?.payeeVpa) setRecipientVpa(res.payeeVpa);
        if (res?.payeeName) setRecipientName(res.payeeName);
      })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!payment || !payment.paymentId) return;
    // start polling
    setPolling(true);
    pollRef.current = setInterval(async () => {
      try {
        const status = await getPaymentStatus(payment.paymentId);
        setPayment((p) => ({ ...p, status: status.status, providerStatus: status.providerStatus, updatedAt: status.updatedAt }));
        if (status.status && status.status !== "PENDING") {
          clearInterval(pollRef.current);
          setPolling(false);
        }
      } catch (err) {
        // ignore polling errors temporarily
      }
    }, 3000);

    return () => {
      clearInterval(pollRef.current);
      setPolling(false);
    };
  }, [payment]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!user || !user._id) {
      alert("Please login to pay the participation fee.");
      navigate('/login');
      return;
    }
    if (!auctionId) {
      alert("Please provide an auction id (or navigate from an auction page)");
      return;
    }
    const amtPaise = FIXED_FEE_PAISE;
    if (!Number.isInteger(amtPaise) || amtPaise <= 0) {
      alert("Invalid fixed amount configured");
      return;
    }
    if (!payerVpa) {
      alert("Enter your UPI ID (payer)");
      return;
    }

    try {
      setCreating(true);
      const res = await createUpiOrder({
        amount: amtPaise,
        auctionId,
        bidderId: user._id,
        payerVpa,
        note,
      });
      setPayment(res);
      // polling will start from effect
    } catch (err) {
      console.error('createUpiOrder error', err);
      alert(err?.message || 'Failed to create payment');
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async () => {
    if (!payment?.paymentId) return alert('No payment to verify');
    if (!upiTxnId) return alert('Enter UPI transaction id');
    try {
      const paidAmountPaise = payment.amount;
      const res = await verifyPayment({ paymentId: payment.paymentId, upiTxnId, paidAmountPaise });
      setPayment(res.ledger || payment);
      alert('Payment verified');
      // Optionally redirect to auction details
      navigate(`/auction/${auctionId}`);
    } catch (err) {
      console.error('verifyPayment error', err);
      alert(err?.message || 'Verify failed');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Pay Participation Fee</h2>

      <form onSubmit={handleCreate} className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="text-sm">Auction ID</label>
          <input value={auctionId} onChange={(e) => setAuctionId(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div>
          <label className="text-sm">Amount (INR)</label>
          <input type="number" value={amount} readOnly disabled className="w-full p-2 border rounded bg-gray-100" />
          <div className="text-xs text-gray-500 mt-1">Participation fee is fixed at ₹{FIXED_FEE_INR}</div>
        </div>

        <div>
          <label className="text-sm">Your UPI ID (payer)</label>
          <input value={payerVpa} onChange={(e) => setPayerVpa(e.target.value)} className="w-full p-2 border rounded" placeholder="yourupi@bank" />
          <div className="text-xs text-gray-500 mt-1">This is your UPI ID (payer) and will be recorded with the payment.</div>
        </div>

        <div>
          <label className="text-sm">Recipient UPI (site)</label>
          <input value={recipientVpa} readOnly disabled className="w-full p-2 border rounded bg-gray-100" />
          <div className="text-xs text-gray-500 mt-1">Payments will be received at this configured UPI ID.</div>
        </div>

        <div>
          <label className="text-sm">Note (optional)</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-2 border rounded" />
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={creating} className="bg-green-600 text-white px-4 py-2 rounded">
            {creating ? 'Creating...' : 'Create UPI Request'}
          </button>
        </div>
      </form>

      {payment && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Payment Details</h3>
          <div className="mt-2 text-sm">Payment ID: {payment.paymentId}</div>
          <div className="mt-1 text-sm">Amount: ₹{(Number(payment.amount) / 100).toFixed(2)}</div>
          <div className="mt-1 text-sm">Status: {payment.status || 'PENDING'}</div>
          {payment.upiLink && (
            <div className="mt-3">
              <a href={payment.upiLink} className="text-blue-600" target="_blank" rel="noreferrer">Open in UPI app</a>
            </div>
          )}
          {payment.qrBase64 && (
            <div className="mt-3">
              <img src={payment.qrBase64} alt="UPI QR" className="w-40 h-40 object-contain" />
            </div>
          )}

          <div className="mt-4">
            <label className="text-sm">Enter UPI Txn ID (optional, to verify)</label>
            <input value={upiTxnId} onChange={(e) => setUpiTxnId(e.target.value)} className="w-full p-2 border rounded" />
            <div className="flex gap-3 mt-2">
              <button onClick={handleVerify} className="bg-blue-600 text-white px-4 py-2 rounded">Verify Payment</button>
              <button onClick={() => navigate(`/auction/${auctionId}`)} className="bg-gray-200 px-4 py-2 rounded">Back to Auction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
