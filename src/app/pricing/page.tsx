'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Link from 'next/link';
import { 
  Check, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  HelpCircle, 
  ChevronDown, 
  Lock, 
  Star, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { LoginModal } from '@/components/auth/LoginModal';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'How does AI interpret my dreams?',
    a: 'Dreamola utilizes fine-tuned psychological vision models trained on classic Jungian and Freudian archetype frameworks, extracting symbols, emotional undercurrents, and unconscious associations from your narrative.'
  },
  {
    q: 'Can I keep my dreams 100% private?',
    a: 'Yes, absolutely. Lucid and Oracle tier members receive private, encrypted journal vaults. Dreams are only visible to the public Collective Gallery if you explicitly choose to toggle the "Share to Gallery" button.'
  },
  {
    q: 'Can I change or cancel my subscription anytime?',
    a: 'Yes. You can upgrade, downgrade, or cancel your subscription at any time with a single click. You will retain all benefits until the end of your paid billing cycle.'
  },
  {
    q: 'What is the difference between Literal Art and Subconscious Art?',
    a: 'Literal Art ("Paint my Dream") renders the physical scenes and characters as described. Subconscious Art ("Paint my Subconscious") visualizes the underlying emotional atmosphere as a fluid watercolor aura.'
  }
];

export default function PricingPage() {
  let session: any = null;
  let updateSession: any = async () => null;
  try {
    const s = useSession();
    session = s.data;
    updateSession = s.update;
  } catch {}
  const router = useRouter();

  // State
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<'free' | 'mid' | 'premium' | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [error, setError] = useState('');

  const currentPlan = session?.user?.plan || 'free';
  const isAdmin = session?.user?.isAdmin || session?.user?.role === 'admin' || session?.user?.email?.toLowerCase() === 'anshudayma23@gmail.com';

  const handleSubscription = async (planType: 'mid' | 'premium') => {
    if (!session) {
      setShowLoginModal(true);
      return;
    }

    setLoadingPlan(planType);
    setError('');

    try {
      const res = await fetch('/api/payments/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, billingCycle }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize subscription');
      }

      // Initialize Razorpay Checkout
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const options: any = {
          key: data.keyId,
          name: 'Dreamola',
          description: `${planType === 'mid' ? 'Lucid' : 'Oracle'} Membership (${billingCycle})`,
          image: '/favicon.ico',
          amount: data.amount,
          currency: data.currency || 'INR',
          handler: async function (response: any) {
            try {
              // Verify payment and upgrade plan on server
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_subscription_id: response.razorpay_subscription_id,
                  razorpay_signature: response.razorpay_signature,
                  planType,
                })
              });

              if (verifyRes.ok) {
                await updateSession();
                router.push('/dream');
                router.refresh();
              } else {
                const verifyData = await verifyRes.json();
                setError(verifyData.error || 'Payment verification failed.');
              }
            } catch (vErr: any) {
              console.error('Payment verification error:', vErr);
              setError('Payment completed but verification failed. Please refresh.');
            }
          },
          prefill: {
            name: data.name || session.user?.username || '',
            email: data.email || session.user?.email || '',
          },
          theme: {
            color: '#630ed4',
          },
        };

        if (data.subscriptionId) {
          options.subscription_id = data.subscriptionId;
        } else if (data.orderId) {
          options.order_id = data.orderId;
        }

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        throw new Error('Razorpay Checkout SDK failed to load. Please refresh the page.');
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Payment initiation failed. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body-md min-h-screen relative overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container flex flex-col justify-between">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* Ambient Blur Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary-container opacity-20 blur-[120px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-secondary-container opacity-20 blur-[150px] rounded-full mix-blend-multiply"></div>
        <div className="absolute top-[30%] left-[60%] w-[40vw] h-[40vw] bg-tertiary-container opacity-10 blur-[100px] rounded-full mix-blend-multiply"></div>
      </div>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto w-full flex flex-col gap-16 relative z-10">
        
        {/* Hero Header & Billing Toggle */}
        <section className="text-center flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/20 text-label-md font-label-md text-primary">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Sacred Subconscious Membership</span>
          </div>

          <h1 className="font-display-lg text-display-lg text-on-surface max-w-3xl leading-tight">
            Unlock Subconscious <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Depth</span>
          </h1>

          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Choose the sacred tier of nocturnal discovery, psychological analysis, and AI artistic synthesis that fits your journey.
          </p>

          {/* Billing Switcher */}
          <div className="glass-panel bg-white/75 p-1.5 rounded-full flex items-center gap-2 mt-4 relative w-fit mx-auto border border-white shadow-sm">
            <button 
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-button text-button transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Monthly
            </button>

            <button 
              type="button"
              onClick={() => setBillingCycle('annually')}
              className={`px-6 py-2 rounded-full font-button text-button transition-all cursor-pointer flex items-center gap-2 ${
                billingCycle === 'annually'
                  ? 'bg-white text-primary shadow-sm font-bold'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span>Annually</span>
              <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold">
                ✨ 2 Months Free
              </span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-xs font-semibold max-w-md animate-fadeIn">
              {error}
            </div>
          )}
        </section>

        {/* 3-Tier Pricing Matrix */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-stack-lg items-stretch">
          
          {/* Card 1: DREAMER ($0) */}
          <div className="glass-panel bg-white/75 rounded-[2.5rem] p-8 flex flex-col justify-between gap-6 relative group hover:-translate-y-2 transition-transform duration-300 border border-white shadow-[0_8px_32px_rgba(30,27,75,0.06)]">
            <div className="flex flex-col gap-2">
              <span className="bg-surface-container-high text-on-surface text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">
                Nocturnal Novice
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Dreamer</h3>
              
              <div className="flex items-baseline gap-1 my-2">
                <span className="font-display-lg text-display-lg text-on-surface font-bold">₹0</span>
                <span className="text-on-surface-variant text-sm font-medium">/month</span>
              </div>
              <p className="text-sm text-on-surface-variant">Perfect for beginning your dream exploration journey.</p>
            </div>

            <div className="h-px w-full bg-outline-variant/30"></div>

            <ul className="flex flex-col gap-4 flex-grow">
              <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                <Check className="w-5 h-5 text-outline shrink-0 mt-0.5" />
                <span>3 AI interpretations per day</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                <Check className="w-5 h-5 text-outline shrink-0 mt-0.5" />
                <span>1 generated artwork per day</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                <Check className="w-5 h-5 text-outline shrink-0 mt-0.5" />
                <span>Public Collective Gallery access</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface-variant">
                <Check className="w-5 h-5 text-outline shrink-0 mt-0.5" />
                <span>Basic symbol text summaries</span>
              </li>
            </ul>

            <button 
              disabled={currentPlan === 'free'}
              className="w-full py-3.5 rounded-full font-button text-button bg-surface-container text-on-surface-variant border border-outline-variant/20 cursor-default"
            >
              {currentPlan === 'free' ? 'Current Plan' : 'Free Tier'}
            </button>
          </div>

          {/* Card 2: LUCID ($4.99 / $3.99) — [FEATURED MOST RESONANT] */}
          <div className="glass-panel bg-white/90 rounded-[2.5rem] p-8 flex flex-col justify-between gap-6 relative group hover:-translate-y-2 transition-transform duration-300 border-2 border-primary/30 shadow-xl shadow-primary/10 md:scale-105 z-10">
            
            {/* Top Floating Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 aurora-btn text-white px-4 py-1 rounded-full text-xs font-bold shadow-md shadow-primary/20 whitespace-nowrap">
              ⭐ Most Resonant
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <span className="bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">
                Conscious Traveler
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Lucid</h3>
              
              <div className="flex items-baseline gap-1 my-2">
                <span className="font-display-lg text-display-lg text-primary font-bold">
                  {billingCycle === 'annually' ? '₹24' : '₹29'}
                </span>
                <span className="text-on-surface-variant text-sm font-medium">/month</span>
              </div>
              <p className="text-sm text-on-surface-variant">Deep psychological insights and vivid visualizations.</p>
            </div>

            <div className="h-px w-full bg-outline-variant/30"></div>

            <ul className="flex flex-col gap-4 flex-grow">
              <li className="flex items-start gap-3 text-sm text-on-surface font-semibold">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Unlimited text interpretations</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface font-semibold">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>10 Dual AI Artworks per day</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface font-semibold">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Private encrypted Journal</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface font-semibold">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>TTS Audio narrations</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface font-semibold">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Jungian archetype breakdowns</span>
              </li>
            </ul>

            <button 
              type="button"
              disabled={loadingPlan !== null || (currentPlan === 'mid' && !isAdmin)}
              onClick={() => handleSubscription('mid')}
              className={`w-full py-3.5 rounded-full font-button text-button aurora-btn text-white shadow-lg shadow-primary/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 cursor-pointer ${
                currentPlan === 'mid' ? 'opacity-80' : ''
              }`}
            >
              {loadingPlan === 'mid' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : currentPlan === 'mid' ? (
                'Current Plan'
              ) : (
                'Ascend to Lucid'
              )}
            </button>
          </div>

          {/* Card 3: ORACLE ($9.99 / $7.99) — [MASTER SANCTUARY] */}
          <div className="glass-panel bg-white/75 rounded-[2.5rem] p-8 flex flex-col justify-between gap-6 relative group hover:-translate-y-2 transition-transform duration-300 border border-white shadow-[0_8px_32px_rgba(30,27,75,0.06)]">
            <div className="flex flex-col gap-2">
              <span className="bg-surface-tint text-white text-xs font-bold px-3 py-1 rounded-full w-fit mb-2">
                👑 Master Oracle
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Oracle</h3>
              
              <div className="flex items-baseline gap-1 my-2">
                <span className="font-display-lg text-display-lg text-on-surface font-bold">
                  {billingCycle === 'annually' ? '₹39' : '₹49'}
                </span>
                <span className="text-on-surface-variant text-sm font-medium">/month</span>
              </div>
              <p className="text-sm text-on-surface-variant">The ultimate analytical suite for the dedicated dreamer.</p>
            </div>

            <div className="h-px w-full bg-outline-variant/30"></div>

            <ul className="flex flex-col gap-4 flex-grow">
              <li className="flex items-start gap-3 text-sm text-on-surface-variant font-medium">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Everything in Lucid, plus:</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface-variant font-medium">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Unlimited 4K Artwork generations</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface-variant font-medium">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Full Historical Analytics & Radar</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface-variant font-medium">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Monthly PDF Recaps export</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-on-surface-variant font-medium">
                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>Priority server queue</span>
              </li>
            </ul>

            <button 
              type="button"
              disabled={loadingPlan !== null || ((currentPlan === 'premium' || isAdmin) && !session?.user)}
              onClick={() => handleSubscription('premium')}
              className={`w-full py-3.5 rounded-full font-button text-button bg-[#181445] text-white hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                currentPlan === 'premium' || isAdmin ? 'opacity-90' : ''
              }`}
            >
              {loadingPlan === 'premium' ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : currentPlan === 'premium' || isAdmin ? (
                '👑 Active Sanctuary Clearance'
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Enter Sanctuary</span>
                </>
              )}
            </button>
          </div>

        </section>

        {/* Feature Comparison Matrix */}
        <section className="glass-panel bg-white/75 rounded-[2.5rem] p-8 md:p-12 border border-white shadow-[0_8px_32px_rgba(30,27,75,0.06)]">
          <h2 className="font-headline-lg text-2xl md:text-3xl text-center mb-8 text-on-surface font-bold">
            Sacred Feature Comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="py-4 font-bold text-on-surface">Capability</th>
                  <th className="py-4 font-bold text-on-surface text-center">Dreamer (₹0)</th>
                  <th className="py-4 font-bold text-primary text-center">Lucid (₹29)</th>
                  <th className="py-4 font-bold text-on-surface text-center">Oracle (₹49)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                <tr>
                  <td className="py-4 font-medium text-on-surface">Daily Text Interpretations</td>
                  <td className="py-4 text-center text-on-surface-variant">3 / day</td>
                  <td className="py-4 text-center text-primary font-bold">Unlimited</td>
                  <td className="py-4 text-center text-on-surface font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-on-surface">Dual AI Artwork (Literal + Subconscious)</td>
                  <td className="py-4 text-center text-on-surface-variant">1 / day</td>
                  <td className="py-4 text-center text-primary font-bold">10 / day</td>
                  <td className="py-4 text-center text-on-surface font-bold">Unlimited 4K</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-on-surface">Encrypted Private Journal Vault</td>
                  <td className="py-4 text-center text-outline">✕</td>
                  <td className="py-4 text-center text-primary font-bold">✓ Included</td>
                  <td className="py-4 text-center text-on-surface font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-on-surface">TTS Audio Dream Narration</td>
                  <td className="py-4 text-center text-outline">✕</td>
                  <td className="py-4 text-center text-primary font-bold">✓ Included</td>
                  <td className="py-4 text-center text-on-surface font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-on-surface">Subconscious Insights & Emotional Radar</td>
                  <td className="py-4 text-center text-outline">✕</td>
                  <td className="py-4 text-center text-outline">✕</td>
                  <td className="py-4 text-center text-on-surface font-bold">✓ Included</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-on-surface">Monthly PDF Dream Recap Export</td>
                  <td className="py-4 text-center text-outline">✕</td>
                  <td className="py-4 text-center text-outline">✕</td>
                  <td className="py-4 text-center text-on-surface font-bold">✓ Included</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          <h2 className="font-headline-lg text-2xl md:text-3xl font-serif text-center mb-4 text-on-surface font-bold">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                  className="glass-panel bg-white/75 rounded-2xl p-6 border border-white cursor-pointer hover:bg-white transition-all shadow-sm"
                >
                  <div className="flex justify-between items-center gap-4">
                    <h4 className="font-semibold text-sm md:text-base text-on-surface flex items-center gap-2.5">
                      <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                      <span>{faq.q}</span>
                    </h4>
                    <ChevronDown className={`w-4 h-4 text-outline transition-transform duration-300 ${
                      isExpanded ? 'rotate-180 text-primary' : ''
                    }`} />
                  </div>
                  {isExpanded && (
                    <p className="text-xs md:text-sm text-on-surface-variant mt-4 leading-relaxed pl-6 border-l-2 border-primary/20 animate-fadeIn">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full py-stack-lg px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-stack-md bg-transparent border-t border-on-surface/10 max-w-7xl mx-auto z-10 relative mt-16">
        <div className="font-headline-sm text-headline-sm text-on-surface font-bold">
          Dreamola
        </div>
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="/privacy">Privacy Policy</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="/terms">Terms of Service</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="/terms">Cookie Policy</Link>
          <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md" href="/terms">Support</Link>
        </div>
        <div className="text-on-surface-variant font-label-md text-label-md">
          © 2026 Dreamola AI. All rights reserved.
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
