
import {
  IndianRupee,
  Bitcoin,
  Sigma, // Using Sigma as a generic 'E'-like icon for ETH
  Gem, // Using Gem for LTC
  DollarSign, // Using DollarSign for USDT
  Sun, // Using Sun for SOL (Solana)
  Dog, // Using Dog for DOGE
  Coins, // Using Coins for BCH
  BadgeX, // Using BadgeX for XRP
  Network, // Using Network for TRX
  CircleDollarSign, // Fallback
  type LucideIcon,
} from 'lucide-react';

interface CryptoCurrencyIconProps {
  symbol: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  INR: IndianRupee,
  BTC: Bitcoin,
  ETH: Sigma,
  LTC: Gem,
  USDT: DollarSign,
  SOL: Sun,
  DOGE: Dog,
  BCH: Coins,
  XRP: BadgeX,
  TRX: Network,
};

const CryptoCurrencyIcon: React.FC<CryptoCurrencyIconProps> = ({ symbol, className }) => {
  const IconComponent = iconMap[symbol.toUpperCase()] || CircleDollarSign;
  return <IconComponent className={className} />;
};

export default CryptoCurrencyIcon;
