/**
 * Demo-mode inbox and parser test fixtures.
 * Source formats: docs/BUILD_BRIEF.md, section 2.
 *
 * IMPORTANT: browsers cannot read a real device SMS inbox — this fixture
 * stands in for that on the Message Wall screen in demo mode. The real
 * working path is the "upload a screenshot" -> OCR flow in
 * parseTransactionImage(). Label demo mode clearly in the UI; do not let
 * a judge mistake this fixture for a live SMS read.
 */
export const SAMPLE_INBOX = [
  {
    id: "sms-1",
    bankLabel: "SBI",
    text:
      "Dear Customer, Rs.45000.00 debited from A/c XX4521 on 24-Aug-26 23:47:12 " +
      "to VPA scammer123@okhdfcbank (UPI Ref No 412583947261). If not done by " +
      "you, forward this SMS to 9215676766 -SBI",
  },
  {
    id: "sms-2",
    bankLabel: "HDFC Bank",
    text:
      "Alert: Rs 12,500.00 debited from a/c **4521 on 24-08-26 to VPA " +
      "fraudster@ybl. UPI Ref 512348820193. Not you? Call 18002586161. -HDFC Bank",
  },
  {
    id: "sms-3",
    bankLabel: "ICICI Bank",
    text:
      "INR 8,000.00 debited from your A/c XX9981 on 24-Aug-26 for UPI txn. " +
      "Ref No 402719384756. Avl Bal INR 3,241.10 - ICICI Bank",
  },
  {
    id: "sms-4",
    bankLabel: "Bank of Baroda",
    text:
      "Rs.22,000 withdrawn from A/c ...5643 on 24/08/2026 18:32 IST. Info: UPI/" +
      "CR/398271640012/xyz. Bal INR 890.00 -BOB",
  },
  {
    id: "sms-5",
    bankLabel: "PNB",
    text:
      "Your A/c XX7734 debited by Rs 5000.00 on 24-08-2026 15:02:44. UPI Ref " +
      "908172635401 to abc@paytm. If not you, call 18001802222 -PNB",
  },
  {
    id: "sms-6",
    bankLabel: "Paytm Wallet",
    text:
      "Rs 3,499 sent to 91XXXXXXXX21 from Paytm Wallet on 24 Aug 2026, 20:11. " +
      "Order ID PYTM88291736452. Helpline 01204456456",
  },
];
