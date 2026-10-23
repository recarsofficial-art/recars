import { Car, VehicleRibbon, RibbonColor } from './types';

export interface ComputedRibbon {
  text: string;
  color: RibbonColor;
  priority: number;
  isStatus?: boolean;
}

export const PRESET_RIBBONS = [
  { text: 'Just Arrived', color: 'blue' as RibbonColor, description: 'Newly listed vehicle within recent days' },
  { text: 'Hot Deal', color: 'rose' as RibbonColor, description: 'Attractive and competitive pricing' },
  { text: 'Most Viewed', color: 'purple' as RibbonColor, description: 'High customer views and interest' },
  { text: 'Trending', color: 'amber' as RibbonColor, description: 'Popular across buyer searches' },
  { text: 'Price Dropped', color: 'rose' as RibbonColor, description: 'Reduced from original price' },
  { text: 'Best Value', color: 'emerald' as RibbonColor, description: 'Admin-verified value proposition' },
  { text: 'Low KM Driven', color: 'blue' as RibbonColor, description: 'Verified low mileage odometer' },
  { text: 'Single Owner', color: 'emerald' as RibbonColor, description: 'First owner vehicle with clear title' },
  { text: 'Sold Out', color: 'red' as RibbonColor, description: 'Sold vehicle' },
  { text: 'Reserved', color: 'amber' as RibbonColor, description: 'Temporarily reserved' },
];

/**
 * Computes up to 2 active ribbons for any vehicle.
 * Sold Out and Reserved statuses ALWAYS take highest priority.
 */
export function computeCarRibbons(car: Partial<Car>, viewsCount?: number): ComputedRibbon[] {
  const ribbons: ComputedRibbon[] = [];

  // 1. ABSOLUTE TOP PRIORITY: Availability Status (Sold Out / Reserved)
  if (car.availabilityStatus === 'Sold Out') {
    ribbons.push({
      text: 'Sold Out',
      color: 'red',
      priority: 1,
      isStatus: true,
    });
  } else if (car.availabilityStatus === 'Reserved') {
    ribbons.push({
      text: 'Reserved',
      color: 'amber',
      priority: 2,
      isStatus: true,
    });
  }

  // 2. Admin Assigned / Custom Ribbons
  if (Array.isArray(car.customRibbons)) {
    for (const r of car.customRibbons) {
      if (r && r.text && r.text.trim()) {
        const text = r.text.trim();
        // Skip duplicate status if already added
        if (text.toLowerCase() === 'sold out' || text.toLowerCase() === 'reserved') continue;

        ribbons.push({
          text,
          color: r.color || 'rose',
          priority: r.priority || 10,
        });
      }
    }
  }

  // 3. Automatic Data-Driven Ribbons
  const existingTexts = new Set(ribbons.map((r) => r.text.toLowerCase()));

  // Price Dropped
  if (
    car.originalPrice &&
    car.originalPrice > (car.price || 0) &&
    !existingTexts.has('price dropped')
  ) {
    ribbons.push({
      text: 'Price Dropped',
      color: 'rose',
      priority: 12,
    });
    existingTexts.add('price dropped');
  }

  // High Views / Most Viewed
  if (viewsCount && viewsCount >= 10 && !existingTexts.has('most viewed')) {
    ribbons.push({
      text: 'Most Viewed',
      color: 'purple',
      priority: 15,
    });
    existingTexts.add('most viewed');
  }

  // Single Owner
  if (car.ownership === '1st Owner' && !existingTexts.has('single owner')) {
    ribbons.push({
      text: 'Single Owner',
      color: 'emerald',
      priority: 20,
    });
    existingTexts.add('single owner');
  }

  // Low KM Driven (under 45,000 km)
  if (car.kilometers && car.kilometers < 45000 && !existingTexts.has('low km driven')) {
    ribbons.push({
      text: 'Low KM Driven',
      color: 'blue',
      priority: 25,
    });
    existingTexts.add('low km driven');
  }

  // Just Arrived (listed within last 14 days)
  if (car.createdAt && !existingTexts.has('just arrived')) {
    try {
      const createdTime = new Date(car.createdAt).getTime();
      const daysOld = (Date.now() - createdTime) / (1000 * 60 * 60 * 24);
      if (daysOld <= 14) {
        ribbons.push({
          text: 'Just Arrived',
          color: 'blue',
          priority: 30,
        });
        existingTexts.add('just arrived');
      }
    } catch {
      // ignore invalid date
    }
  }

  // Sort by priority ascending (lower number = higher precedence)
  ribbons.sort((a, b) => a.priority - b.priority);

  // Maximum of two ribbons per vehicle card to avoid clutter
  return ribbons.slice(0, 2);
}

export function getRibbonColorStyles(color: RibbonColor): { bg: string; text: string; border: string; dot: string } {
  switch (color) {
    case 'red':
      return {
        bg: 'bg-rose-600',
        text: 'text-white',
        border: 'border-rose-400',
        dot: 'bg-white',
      };
    case 'rose':
      return {
        bg: 'bg-[#E5325C]',
        text: 'text-white',
        border: 'border-rose-400',
        dot: 'bg-white',
      };
    case 'amber':
      return {
        bg: 'bg-amber-500',
        text: 'text-white',
        border: 'border-amber-300',
        dot: 'bg-amber-100',
      };
    case 'emerald':
      return {
        bg: 'bg-emerald-600',
        text: 'text-white',
        border: 'border-emerald-400',
        dot: 'bg-emerald-100',
      };
    case 'blue':
      return {
        bg: 'bg-sky-600',
        text: 'text-white',
        border: 'border-sky-400',
        dot: 'bg-sky-100',
      };
    case 'purple':
      return {
        bg: 'bg-purple-600',
        text: 'text-white',
        border: 'border-purple-400',
        dot: 'bg-purple-100',
      };
    case 'dark':
    default:
      return {
        bg: 'bg-[#101216]',
        text: 'text-white',
        border: 'border-gray-700',
        dot: 'bg-gray-300',
      };
  }
}
