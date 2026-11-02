import {
  Users, Zap, Fuel, UtensilsCrossed, Lightbulb, Clapperboard, ShoppingBag,
  HeartPulse, Bus, Home, GraduationCap, Plane, Gift, Smartphone, Coffee,
  Dumbbell, PawPrint, Shirt, Wrench, Receipt, Banknote, TrendingUp, Package,
  Briefcase, Landmark, Coins, Bitcoin, PiggyBank, Building2, Car, Baby, Wifi,
} from 'lucide-react';

// Categories in the database store an emoji. For a cleaner, consistent look
// we map known names to line icons; anything unknown (custom categories)
// falls back to the user's own emoji. Nothing in the database is changed.
const RULES = [
  [/family|kids|parent/i, Users],
  [/baby|child/i, Baby],
  [/impulse|malicious|misc/i, Zap],
  [/petrol|fuel|gas/i, Fuel],
  [/food|dining|restaurant|grocer|\beat/i, UtensilsCrossed],
  [/coffee|cafe|\btea\b/i, Coffee],
  [/bill|utilit|electric|water/i, Lightbulb],
  [/internet|wifi|broadband/i, Wifi],
  [/entertain|movie|game|netflix|stream/i, Clapperboard],
  [/shop|cloth|fashion/i, ShoppingBag],
  [/apparel|dress|shirt/i, Shirt],
  [/health|medic|doctor|pharma|hospital/i, HeartPulse],
  // transport must come before the gym rule ("transport" contains "sport")
  [/transport|\bbus\b|train|metro|taxi|\bcabs?\b|uber/i, Bus],
  [/\bgym\b|fitness|\bsports?\b/i, Dumbbell],
  [/\bcars?\b|vehicle|\bbikes?\b/i, Car],
  [/\brent\b|home|house|\bemi\b/i, Home],
  [/educat|school|course|book|study/i, GraduationCap],
  [/travel|trip|flight|holiday|vacation/i, Plane],
  [/gift|donat|charity/i, Gift],
  [/phone|mobile|recharge/i, Smartphone],
  [/\bpets?\b/i, PawPrint],
  [/repair|maint|service/i, Wrench],
  [/\btax|\bfees?\b|insurance/i, Receipt],
];

const INCOME_RULES = [
  [/salary|pay|wage/i, Briefcase],
  [/business|freelanc|client/i, Building2],
  [/interest|dividend/i, Landmark],
  [/gift/i, Gift],
];

const INVEST_RULES = [
  [/crypto|bitcoin|btc|eth/i, Bitcoin],
  [/gold|silver/i, Coins],
  [/\bfd\b|fixed|deposit|bond|\bppf\b|\bnps\b/i, PiggyBank],
  [/real|estate|property|land/i, Building2],
];

export function iconFor(type, name = '') {
  const rules = type === 'income' ? INCOME_RULES : type === 'investment' ? INVEST_RULES : RULES;
  const hit = rules.find(([re]) => re.test(name));
  if (hit) return hit[1];
  if (type === 'income') return Banknote;
  if (type === 'investment') return TrendingUp;
  return null;
}

/**
 * Rounded tile with an icon. `color` (hex) tints expense categories; income
 * and investments use the neutral/semantic palette.
 */
export default function CategoryIcon({ type = 'expense', name, emoji, color, size = 'md', className = '' }) {
  const Icon = iconFor(type, name);
  const dims = size === 'sm' ? 'w-9 h-9 rounded-xl' : size === 'lg' ? 'w-12 h-12 rounded-2xl' : 'w-10 h-10 rounded-xl';
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  let style;
  let tone = '';
  if (type === 'expense' && color) {
    style = { backgroundColor: `${color}1f`, color };
  } else if (type === 'income') {
    tone = 'bg-income/10 text-income';
  } else {
    tone = 'bg-surface-2 text-ink';
  }

  return (
    <div className={`${dims} ${tone} shrink-0 flex items-center justify-center ${className}`} style={style} aria-hidden>
      {Icon ? (
        <Icon size={iconSize} strokeWidth={1.9} />
      ) : emoji ? (
        <span className={size === 'sm' ? 'text-base' : 'text-lg'}>{emoji}</span>
      ) : (
        <Package size={iconSize} strokeWidth={1.9} />
      )}
    </div>
  );
}
