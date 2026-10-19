import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { Gift, ShieldCheck, HeartHandshake, Sparkles, Music2, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const user = await getSession();

  // Calculate days until Christmas
  const now = new Date();
  const currentYear = now.getFullYear();
  let christmasDate = new Date(currentYear, 11, 25);
  if (now > christmasDate) {
    christmasDate = new Date(currentYear + 1, 11, 25);
  }
  const diffTime = Math.abs(christmasDate.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-16 py-6 sm:py-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#144534] border border-[#d4af37]/40 text-[#f3c053] text-sm shadow-sm">
          <Sparkles className="w-4 h-4 text-[#d4af37]" />
          <span>{diffDays} days until Christmas!</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#fef9ee] font-festive">
          Celebrate Christmas Together
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
          The private, secure, and festive Secret Santa web application designed specifically for your family.
          Exchange joy, share wish lists, and keep the holiday magic alive every single year.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full bg-[#d4af37] text-[#0b2b20] font-bold text-base hover:bg-[#f3c053] transition shadow-lg shadow-[#d4af37]/20"
            >
              <span>Go to Family Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-full bg-[#d4af37] text-[#0b2b20] font-bold text-base hover:bg-[#f3c053] transition shadow-lg shadow-[#d4af37]/20"
              >
                <span>Join or Create Family</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#144534] text-[#fef9ee] font-medium text-base hover:bg-[#1d5943] border border-[#1d5943] transition"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="festive-card p-6 rounded-2xl space-y-3 border border-[#1d5943]">
          <div className="w-12 h-12 rounded-xl bg-[#0b2b20] flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30">
            <Gift className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#fef9ee] font-festive">Fair & Smart Drawing</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Randomized matching engine with spouse/partner exclusions. Nobody draws themselves, and impossible setups are cleanly flagged.
          </p>
        </div>

        <div className="festive-card p-6 rounded-2xl space-y-3 border border-[#1d5943]">
          <div className="w-12 h-12 rounded-xl bg-[#0b2b20] flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#fef9ee] font-festive">Strict Privacy</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Assignments are strictly secret. Even family administrators cannot view who drew whom, keeping the holiday surprise intact.
          </p>
        </div>

        <div className="festive-card p-6 rounded-2xl space-y-3 border border-[#1d5943]">
          <div className="w-12 h-12 rounded-xl bg-[#0b2b20] flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#fef9ee] font-festive">Holiday Wish Lists</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Share gift ideas, sizes, favorite colors, and hobby notes directly with your Secret Santa, complete with a private purchase tracker.
          </p>
        </div>
      </section>

      {/* Music & Atmosphere Banner */}
      <section className="festive-card p-8 rounded-2xl bg-gradient-to-r from-[#144534] via-[#0b2b20] to-[#144534] border border-[#d4af37]/30 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 text-[#f3c053] text-sm font-semibold">
            <Music2 className="w-4 h-4" />
            <span>Festive Atmosphere</span>
          </div>
          <h3 className="text-2xl font-bold text-[#fef9ee] font-festive">
            Christmas Carols & Gentle Snowfall
          </h3>
          <p className="text-sm text-slate-300 max-w-xl">
            Enjoy gentle snowfall and soothing holiday melodies as you plan your gifts.
            Sound and animations are optional and respect your device preferences.
          </p>
        </div>
        <div className="shrink-0 text-5xl">
          🎁 ✨ 🎄
        </div>
      </section>
    </div>
  );
}
