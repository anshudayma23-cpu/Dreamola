export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#09090e] text-white p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl pb-32 mt-12 space-y-6 font-serif leading-relaxed">
        <h1 className="text-4xl md:text-5xl text-purple-200 mb-8">Refunds & Cancellation Policy</h1>
        
        <p className="text-sm text-white/40">Last Updated: August 16, 2026</p>

        <p className="text-lg text-white/80">
          At Dreamola, we strive to provide the best digital dream exploration tools. Please read our policy regarding subscription cancellations and refund requests below.
        </p>

        <h2 className="text-2xl text-purple-200/90 mt-8">1. Subscription Cancellation</h2>
        <p className="text-lg text-white/80">
          You can cancel your subscription (Lucid or Oracle tiers) at any time. To cancel, go to your **Account Settings** and click **Cancel Subscription**, or reach out to us at <span className="underline text-purple-300">anshudayma23@gmail.com</span>. 
          Upon cancellation, no further charges will apply, and you will retain full premium access benefits until the end of your current active billing cycle.
        </p>

        <h2 className="text-2xl text-purple-200/90 mt-8">2. Refund Policy</h2>
        <p className="text-lg text-white/80">
          Since Dreamola provides intangible, digital access tokens (interpreted texts and generated images) which are consumed immediately upon generation, **we do not offer refunds for partial monthly periods or unused credits**. 
          All subscription payments processed via Razorpay are final.
        </p>

        <h2 className="text-2xl text-purple-200/90 mt-8">3. Exceptional Cases</h2>
        <p className="text-lg text-white/80">
          If you believe you have been charged in error due to a system glitch or double-billing error on our end, please email us within **7 days** of the transaction date. We will investigate and process a full refund to your original payment method if an error is verified.
        </p>

        <h2 className="text-2xl text-purple-200/90 mt-8">4. Contact Support</h2>
        <p className="text-lg text-white/80">
          For any billing disputes or inquiries regarding cancellations, please contact us at <span className="underline text-purple-300">anshudayma23@gmail.com</span>.
        </p>
      </div>
    </div>
  );
}
