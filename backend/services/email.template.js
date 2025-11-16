const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, "");
const BACKEND_URL = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, "");

export const Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #4CAF50;
              background: #e8f5e9;
              border: 1px dashed #4CAF50;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p>If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;




export const Welcome_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to BidSphere</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #ddd;
        }
        .header {
            background-color: #007BFF;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 26px;
            font-weight: bold;
        }
        .content {
            padding: 25px;
            line-height: 1.8;
        }
        .welcome-message {
            font-size: 18px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 25px;
            margin: 20px 0;
            background-color: #007BFF;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #0056b3;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 15px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
        p {
            margin: 0 0 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Welcome to BidSphere!</div>
        <div class="content">
            <p class="welcome-message">Hello {name},</p>
            <p>We’re excited to have you on BidSphere, your online auction platform! Your registration was successful, and you can now start exploring and bidding on amazing items.</p>
            <p>Here’s how you can get started:</p>
            <ul>
                <li>Browse auctions and find items you love.</li>
                <li>Place bids and track your auctions.</li>
                <li>Contact our support team if you need any help.</li>
            </ul>
            <a href="${FRONTEND_URL}/bidsphere" class="button" target="_blank" rel="noopener noreferrer">Start Bidding Now</a>
            <p>If you have any questions or need assistance, our team is here to help you every step of the way. Happy bidding!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;


export const Outbid_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Outbid Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #ddd;
        }
        .header {
            background-color: #1a73e8;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 26px;
            font-weight: bold;
        }
        .content {
            padding: 25px;
            line-height: 1.8;
        }
        .auction-title {
            font-size: 18px;
            color: #444;
            margin-bottom: 10px;
        }
        .item-name {
            font-size: 20px;
            font-weight: bold;
            color: #1a73e8;
        }
        .button {
            display: inline-block;
            padding: 12px 25px;
            margin: 20px 0;
            background-color: #1a73e8;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        .button:hover {
            background-color: #155ab6;
        }
        .footer {
            background-color: #f4f4f4;
            padding: 15px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
        p {
            margin: 0 0 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Outbid Notification</div>
        <div class="content">
            <p>Dear User,</p>
            
            <p>You’ve been <strong>outbid</strong> in the auction:</p>
            <p class="auction-title">{auctionTitle}</p>
            
            <p>for the item:</p>
            <p class="item-name">{itemName}</p>

            <p>The new highest bid is: <strong>${'{currentBid}'}</strong>.</p>
            <p>Your maximum auto-bid limit: <strong>${'{maxLimit}'}</strong>.</p>

            <p>If you’d like to increase your auto-bid limit or place a new bid, click below:</p>
            <a href="${BACKEND_URL}/bidsphere/${'{auctionId}'}/bid/editauto/${'{autobidId}'}"
               class="button" target="_blank" rel="noopener noreferrer">
                Edit Auto-Bid
            </a>

            <p>Thank you for using <strong>BidSphere</strong>. Stay in the game and keep bidding!</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const Reset_Password_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #007bff;
              color: #ffffff;
              padding: 20px;
              text-align: center;
              font-size: 24px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .reset-link {
              display: inline-block;
              margin: 20px 0;
              padding: 12px 20px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
          }
          .reset-link:hover {
              background-color: #0056b3;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Reset Your Password</div>
          <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your BidSphere password. You can reset it by clicking the button below:</p>
              <a href="{resetLink}" class="reset-link" target="_blank">Reset Password</a>
              <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

export const Auction_Winner_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Auction Winner</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0; padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid #ddd;
        }
        .header {
            background-color: #673AB7;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 26px;
            font-weight: bold;
        }
        .content {
            padding: 25px; color: #333; line-height: 1.8;
        }
        .button {
            display: inline-block;
            padding: 12px 25px;
            margin: 10px 10px 0 0;
            background-color: #2196F3;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .button.cod { background-color: #FF9800; }
        .footer {
            background-color: #f4f4f4;
            padding: 15px;
            text-align: center;
            color: #777;
            font-size: 12px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">🎉 You Won the Auction!</div>

        <div class="content">
            <p>Hello <strong>{name}</strong>,</p>

            <p>Congratulations! You have won the auction for:</p>
            <p><strong>Auction:</strong> {auctionName}</p>

            <p>Please choose a payment method within <strong>24 hours</strong>:</p>

            <a href="${BACKEND_URL}/bidsphere/auctions/${'{auctionId}'}/finalpay/upi" class="button">UPI Payment</a>
            <a href="${BACKEND_URL}/5000/bidsphere/auctions/${'{auctionId}'}/finalpay/cod" class="button cod">Cash on Delivery (COD)</a>

            <p>If no payment option is selected in time, the order will be cancelled.</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const COD_Selected_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>COD Confirmed</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background:#f4f4f4; }
        .container {
            max-width: 600px; margin: 30px auto; background: #fff;
            border-radius: 8px; border: 1px solid #ddd;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .header {
            background:#FF9800; color:#fff; padding:20px;
            text-align:center; font-size:26px; font-weight:bold;
        }
        .content { padding:25px; line-height:1.8; color:#333; }
        .footer {
            padding:15px; background:#f4f4f4; text-align:center;
            font-size:12px; color:#777; border-top:1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">COD Confirmed</div>

        <div class="content">
            <p>Hello <strong>{name}</strong>,</p>

            <p>Your payment method has been set to <strong>Cash on Delivery (COD)</strong> for:</p>
            <p><strong>Auction:</strong> {auctionName}</p>

            <p>Your order is now confirmed and your item is being prepared for delivery.</p>
            <p>You will receive tracking updates soon.</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const UPI_Selected_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UPI Payment Details</title>
    <style>
        body { font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
        .container {
            max-width: 600px; margin:30px auto; background:#fff;
            border-radius:8px; border:1px solid #ddd;
            box-shadow:0 4px 15px rgba(0,0,0,0.1);
        }
        .header {
            background:#4CAF50; color:#fff; padding:20px;
            text-align:center; font-size:26px; font-weight:bold;
        }
        .content { padding:25px; line-height:1.8; color:#333; }
        .upi-box {
            margin:20px 0; padding:15px; background:#e8f5e9;
            border:1px dashed #4CAF50; border-radius:5px; font-size:18px;
        }
        .qr-section {
            margin-top: 20px;
            text-align: center;
        }
        .qr-section img {
            width: 220px;
            height: 220px;
        }
        .footer {
            background:#f4f4f4; padding:15px; text-align:center;
            color:#777; border-top:1px solid #ddd; font-size:12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">UPI Payment Required</div>

        <div class="content">
            <p>Hello <strong>{name}</strong>,</p>

            <p>You have selected <strong>UPI Payment</strong> for:</p>
            <p><strong>Auction:</strong> {auctionName}</p>

            <div class="upi-box">
                <p><strong>UPI LINK:</strong> {upiLink}</p>
                <p><strong>Amount:</strong> ₹{amount}</p>
                <p><strong>Time Limit:</strong> 24 hours</p>
            </div>

            <div class="qr-section">
                <p><strong>Scan this QR to Pay:</strong></p>
                {qrCode}
            </div>

            <p>Please complete your payment and upload the screenshot/transaction ID on your dashboard.</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const Payment_Verified_Email_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Verified</title>
    <style>
        body { font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
        .container {
            max-width:600px; margin:30px auto; background:#fff;
            border-radius:8px; border:1px solid #ddd;
            box-shadow:0 4px 15px rgba(0,0,0,0.1);
        }
        .header {
            background:#2196F3; color:#fff; padding:20px;
            text-align:center; font-size:26px; font-weight:bold;
        }
        .content { padding:25px; color:#333; line-height:1.8; }
        .footer {
            background:#f4f4f4; padding:15px; text-align:center;
            font-size:12px; color:#777; border-top:1px solid #ddd;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">✔ Payment Verified</div>

        <div class="content">
            <p>Hello <strong>{name}</strong>,</p>

            <p>Your UPI payment has been successfully verified for:</p>
            <p><strong>Auction:</strong> {auctionName}</p>

            <p>Your order is now confirmed and will be shipped soon.</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

export const Payment_Rejection_Template = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f6f6f6;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 25px;">
      <h2 style="color: #e63946;">Payment Failed</h2>
      <p>Dear User,</p>

      <p>
        Unfortunately, your recent payment attempt was <strong>unsuccessful</strong>.
      </p>

      <p style="margin-top: 10px;">
        <strong>Reason:</strong> {reason}
      </p>

      <p>
        Please try again using a different payment method or ensure your bank/card allows online transactions.
      </p>
      <a href="${BACKEND_URL}/bidsphere/auctions/${'{auctionId}'}/finalpay" 
         style="display: inline-block; margin-top: 15px; padding: 10px 20px; background: #1d3557; color: white; text-decoration: none; border-radius: 5px;">
         Retry Payment
      </a>

      <p style="margin-top: 20px;">
        If you need help, feel free to contact our support team.
      </p>

      <p>Regards,<br>BidSphere Team</p>
    </div>
  </div>
`;

export const PAYMENT_Verification_Request_Sent_Template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Verification Request Sent</title>
    <style>
        body { font-family: Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
        .container {
            max-width: 600px; margin:30px auto; background:#fff;
            border-radius:8px; border:1px solid #ddd;
            box-shadow:0 4px 15px rgba(0,0,0,0.1);
        }
        .header {
            background:#2196F3; color:#fff; padding:20px;
            text-align:center; font-size:26px; font-weight:bold;
        }
        .content { padding:25px; line-height:1.8; color:#333; }
        .info-box {
            margin:20px 0; padding:15px; background:#e3f2fd;
            border:1px dashed #2196F3; border-radius:5px; font-size:16px;
        }
        .footer {
            background:#f4f4f4; padding:15px; text-align:center;
            color:#777; border-top:1px solid #ddd; font-size:12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">Payment Verification Request Sent</div>

        <div class="content">
            <p>Hello <strong>{name}</strong>,</p>

            <p>Your payment verification request for the following auction has been submitted:</p>
            <p><strong>Auction:</strong> {auctionName}</p>

            <div class="info-box">
                <p><strong>Status:</strong> Pending Admin Review</p>
                <p><strong>Your payment request is for: </strong>{reqFor}</p>
            </div>

            <p>Our team will review the payment details shortly. You will receive a confirmation email once the verification is completed.</p>

            <p>No additional action is required from you at the moment. If there are any issues with the payment details, we will notify you.</p>
        </div>

        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BidSphere. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;