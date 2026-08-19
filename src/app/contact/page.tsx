export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#09090e] text-white p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-xl pb-32 mt-12 space-y-8 font-serif leading-relaxed text-center">
        <h1 className="text-4xl md:text-5xl text-purple-200">Contact Us</h1>
        
        <p className="text-lg text-white/70">
          Have feedback, feature ideas, or database questions? We would love to hear from you.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
          <p className="text-xl font-bold">Email Support</p>
          <a 
            href="mailto:anshudayma23@gmail.com" 
            className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-lg"
          >
            anshudayma23@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
