import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const items = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders above ₹499' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: '100% protected checkout' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
  { icon: Headphones, title: '24/7 Support', desc: "We're always here" },
];

export default function TrustStrip() {
  return (
    <div className="bg-white border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-5 py-5 grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/5 text-[var(--primary)] flex items-center justify-center shrink-0">
                <Icon size={19} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--ink)] truncate">{item.title}</p>
                <p className="text-[11px] text-[var(--muted)] truncate">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}