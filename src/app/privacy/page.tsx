export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090e] text-white p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl pb-32 mt-12 space-y-6 font-serif leading-relaxed">
        <h1 className="text-4xl md:text-5xl text-purple-200 mb-8">Privacy Policy</h1>
        
        <p className="text-sm text-white/40">Last Updated: August 16, 2026</p>

        <p className="text-lg text-white/80">
          At Dreamola, your privacy and the security of your dreams are of utmost importance. This Privacy Policy details how we handle the personal information you share with us.
        </p>

        <h2 className="text-2xl text-purple-200/90 mt-8">1. Information We Collect</h2>
        <p className="text-lg text-white/80">
          We collect information directly provided by you, including your email, username, and password when you register. We also store the dream descriptions and preferences you save to your private journal or choose to publish to the community gallery.
        </p>

        <h2 className="text-2xl text-purple-200/90 mt-8">2. Cookies & Analytics</h2>
        <p className="text-lg text-white/80">
          We use cookies to maintain your login session and track anonymous usage limits for our free tier. We may also implement third-party analytics and ad tracking (such as Google AdSense) to keep the basic platform running for free.
        </p>

        <h2 className="text-2xl text-purple-200/90 mt-8">3. Cloud Storage & Third Parties</h2>
        <p className="text-lg text-white/80">
          We utilize third-party database adapters, hosting providers, and cloud image hosts to deploy and service the app. Any text you submit for art generation is passed through sandboxed content filters to ensure safety compliance.
        </p>

        <h2 className="text-2xl text-purple-200/90 mt-8">4. Data Control & Deletion</h2>
        <p className="text-lg text-white/80">
          You maintain full ownership of your journal entries. You can edit their visibility (private vs. public) or delete your entries permanently at any time. To request full deletion of your user account, please contact us.
        </p>

        <h2 className="text-2xl text-purple-200/90 mt-8">5. Contact Info</h2>
        <p className="text-lg text-white/80">
          For any questions about your data or this policy, please reach out to us at <span className="underline text-purple-300">anshudayma23@gmail.com</span>.
        </p>
      </div>
    </div>
  );
}
