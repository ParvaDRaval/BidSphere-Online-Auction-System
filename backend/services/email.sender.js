import transporter  from "./email.transporter.js";
import { Verification_Email_Template } from "../email-templates/verify_email.template.js"
import { Welcome_Email_Template } from "../email-templates/welcome_email.template.js"
import { Outbid_Email_Template } from "../email-templates/outbid_email.template.js"
import { Reset_Password_Email_Template } from "../email-templates/restPwd_email.template.js" 
import { Auction_Winner_Email_Template } from "../email-templates/auctionWinner_email.template.js"
import { COD_Selected_Email_Template } from "../email-templates/cod_email.template.js"
import { UPI_Selected_Email_Template } from "../email-templates/upi_email.template.js"
import { Payment_Verified_Email_Template } from "../email-templates/paymentVerification_email.template.js"
import { Payment_Rejection_Template } from "../email-templates/paymentRejection_email.template.js"
import { PAYMENT_Verification_Request_Sent_Template } from "../email-templates/paymentVerifyRequest_email.template.js"
import QRCode from "qrcode";
import dotenv from "dotenv";
dotenv.config();
const SendVerificationCode = async (email, verificationCode) => {
    try {
        const response = await transporter.sendMail({
            from: process.env.BREVO_FROM_EMAIL,
            to: email,
            subject: "Verify your Email, Welcome to BidSphere",
            html: Verification_Email_Template.replace("{verificationCode}", verificationCode),
        });

        console.log("Verification Email send successfully", response);
    } catch (error) {
        console.log("catch error", error);
    }
}

const WelcomeEmail = async (email, name) => {
    try {
        const response = await transporter.sendMail({
            from: process.env.BREVO_FROM_EMAIL,
            to: email,
            subject: "Welcome to BidSphere",
            html:  Welcome_Email_Template.replace("{name}", name)
        });

        console.log("Welcome Email send successfully", response);
    } catch (error) {
        console.log("catch error", error);
    }
}

const SendOutBidEmail= async (email, itemName, currentBid, maxLimit, auctionId, title) =>{
    try{
        const htmlContent = Outbid_Email_Template
            .replace("{itemName}", itemName)
            .replace("{auctionTitle}", title)
            .replace("{currentBid}", currentBid)
            .replace("{maxLimit}", maxLimit)
            .replaceAll("{auctionId}", auctionId);

        const response = await transporter.sendMail({
          from: process.env.BREVO_FROM_EMAIL,
          to: email,
          subject: `You've Been Outbid on ${itemName} in ${title} - BidSphere`,
          html: htmlContent,
        });

        console.log("Outbid email sent successfully", response);
    } catch (error) {
        console.log("Error sending outbid email", error);
    }
}

const SendResetPwdEmail = async (email, resetPwdLink) => {
  try {
    const response = await transporter.sendMail({
      from: process.env.BREVO_FROM_EMAIL,
      to: email,
      subject: "Reset your BidSphere Password",
      html: Reset_Password_Email_Template.replace("{resetLink}", resetPwdLink)
    });

    console.log("Email sent successfully", response);
  } catch (error) {
    console.log("catch error", error);
  }
};

const SendAuctionWinnerEmail = async (email, name, auctionName) => {
    try {
        const htmlContent = Auction_Winner_Email_Template
            .replace("{name}", name)
            .replace("{auctionName}", auctionName)

        const response = await transporter.sendMail({
            from: process.env.BREVO_FROM_EMAIL,
            to: email,
            subject: "You Won the Auction! Choose Your Payment Method",
            html: htmlContent,
        });

        console.log("Auction winner mail sent successfully:", response);
    } catch (error) {
        console.log("Auction winner mail error:", error);
    }
};

const SendCODSelectedEmail = async (email, name, auctionName) => {
    try {
        const htmlContent = COD_Selected_Email_Template
            .replace("{name}", name)
            .replace("{auctionName}", auctionName);

        const response = await transporter.sendMail({
            from: process.env.BREVO_FROM_EMAIL,
            to: email,
            subject: "COD Payment Confirmed – Your Order is Out for Delivery",
            html: htmlContent,
        });

        console.log("COD selected email sent successfully:", response);
    } catch (error) {
        console.log("COD selected email error:", error);
    }
};

const SendUPISelectedEmail = async (email, name, auctionName, upiLink, amount) => {
    try {
        const qrBuffer = await QRCode.toBuffer(upiLink);

        const htmlContent = UPI_Selected_Email_Template
            .replace("{name}", name)
            .replace("{auctionName}", auctionName)
            .replace("{upiLink}", upiLink)
            .replace("{amount}", amount)
            .replace("{qrCode}", `<img src="cid:qrimage@bidsphere" />`);

        const response = await transporter.sendMail({
            from: process.env.BREVO_FROM_EMAIL,
            to: email,
            subject: "UPI Payment Details for Your Auction Order",
            html: htmlContent,
            attachments: [
                {
                    filename: "qr.png",
                    content: qrBuffer,
                    cid: "qrimage@bidsphere"
                }
            ]
        });

        console.log("UPI selected email sent successfully:", response);
    } catch (error) {
        console.log("UPI selected email error:", error);
    }
};

const SendPaymentVerifiedEmail = async (email, name, auctionName) => {
    try {
        const htmlContent = Payment_Verified_Email_Template
            .replace("{name}", name)
            .replace("{auctionName}", auctionName)

        const response = await transporter.sendMail({
            from: process.env.BREVO_FROM_EMAIL,
            to: email,
            subject: "Payment Verified – Your Order is Confirmed",
            html: htmlContent,
        });

        console.log("Payment verified email sent successfully:", response);
    } catch (error) {
        console.log("Payment verified email error:", error);
    }
};

const SendPaymentRejection = async (email, reason) => {
    try {
        const htmlContent = Payment_Rejection_Template
            .replace("{reason}", reason)

        const response = await transporter.sendMail({
            from: process.env.BREVO_FROM_EMAIL,
            to: email,
            subject: "Payment Failed – Action Required",
            html: htmlContent,
        });

        console.log("Payment rejection email sent successfully", response);
    } catch (error) {
        console.log("Error sending payment rejection email:", error);
    }
};

const SendPaymentVerificationRequestSent = async (email, name, auctionName, reqFor) => {
  try {
    const htmlContent = PAYMENT_Verification_Request_Sent_Template
      .replace("{name}", name)
      .replace("{auctionName}", auctionName)
      .replace("{reqFor}", reqFor)
      
    const response = await transporter.sendMail({
      from: process.env.BREVO_FROM_EMAIL,
      to: email,
      subject: "Payment Verification Request Received",
      html: htmlContent,
    });

    console.log("Payment verification-request email sent successfully", response);
  } catch (error) {
    console.log("Error sending payment verification-request email:", error);
  }
};

export { 
    SendVerificationCode, 
    WelcomeEmail, 
    SendOutBidEmail, 
    SendResetPwdEmail, 
    SendAuctionWinnerEmail, 
    SendCODSelectedEmail, 
    SendUPISelectedEmail, 
    SendPaymentVerifiedEmail,
    SendPaymentRejection,
    SendPaymentVerificationRequestSent
 };