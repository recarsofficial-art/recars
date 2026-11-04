import { Car, CarBodyType } from './types';

export const CITIES = [
  'Warangal',
  'Hyderabad',
] as const;

export const CAR_TYPES: { type: CarBodyType; label: string; startingPrice: string; image: string }[] = [
  { type: 'Hatchback', label: 'Hatchback', startingPrice: 'From ₹2 Lakh', image: '/type-hatchback.jpg' },
  { type: 'Sedan', label: 'Sedan', startingPrice: 'From ₹3 Lakh', image: '/type-sedan.jpg' },
  { type: 'SUV', label: 'SUV', startingPrice: 'From ₹5 Lakh', image: '/type-suv.jpg' },
  { type: 'Luxury', label: 'Luxury', startingPrice: 'From ₹15 Lakh', image: '/type-luxury.jpg' },
  { type: 'MUV', label: 'MUV', startingPrice: 'From ₹8 Lakh', image: '/type-muv.jpg' },
  { type: 'Electric', label: 'Electric', startingPrice: 'From ₹8 Lakh', image: '/type-electric.jpg' },
];

export const MAKES = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Mahindra',
  'Honda',
  'Toyota',
  'Kia',
  'Volkswagen',
  'Skoda',
  'MG',
  'Renault',
  'Ford',
  'Nissan',
  'Jeep',
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Land Rover',
  'Range Rover',
  'Jaguar',
  'Volvo',
  'Fiat',
  'Mitsubishi',
  'Citroen',
  'VinFast',
  'Chevrolet',
  'Hindustan Motors',
  'JSW',
  'BYD',
  'Isuzu',
  'Force Motors',
  'Lexus',
  'Mini',
  'Porsche',
  'Datsun',
] as const;

export const MODELS_BY_MAKE: Record<string, string[]> = {
  'Maruti Suzuki': ['Swift', 'Baleno', 'Brezza', 'Dzire', 'Grand Vitara', 'Ertiga', 'Wagon R', 'Alto K10', 'Fronx', 'Jimny', 'Ciaz', 'XL6', 'Ignis'],
  Hyundai: ['Creta', 'Venue', 'i20', 'Verna', 'Tucson', 'Aura', 'Exter', 'Alcazar', 'Grand i10 Nios', 'Ioniq 5'],
  Tata: ['Nexon', 'Nexon EV', 'Harrier', 'Safari', 'Punch', 'Punch EV', 'Altroz', 'Tiago', 'Tigor', 'Curvv'],
  Mahindra: ['XUV700', 'Thar', 'Scorpio-N', 'Scorpio Classic', 'XUV 3XO', 'XUV300', 'Bolero', 'Bolero Neo', 'XUV400 EV'],
  Honda: ['City', 'Amaze', 'Elevate', 'WR-V', 'Jazz', 'Civic', 'CR-V'],
  Toyota: ['Fortuner', 'Innova Crysta', 'Innova Hycross', 'Urban Cruiser', 'Hyryder', 'Camry', 'Glanza', 'Hilux', 'Land Cruiser'],
  Kia: ['Seltos', 'Sonet', 'Carens', 'EV6', 'Carnival', 'EV9'],
  Volkswagen: ['Virtus', 'Taigun', 'Polo', 'Vento', 'Tiguan', 'Ameo', 'T-Roc', 'Passat'],
  Skoda: ['Slavia', 'Kushaq', 'Octavia', 'Superb', 'Kodiaq', 'Rapid', 'Kylaq'],
  MG: ['Hector', 'Hector Plus', 'ZS EV', 'Astor', 'Comet EV', 'Gloster', 'Windsor EV'],
  Renault: ['Kwid', 'Triber', 'Kiger', 'Duster', 'Lodgy', 'Captur'],
  Ford: ['EcoSport', 'Endeavour', 'Figo', 'Aspire', 'Freestyle', 'Mustang'],
  Nissan: ['Magnite', 'Kicks', 'Micra', 'Sunny', 'Terrano', 'X-Trail'],
  Jeep: ['Compass', 'Meridian', 'Wrangler', 'Grand Cherokee'],
  Audi: ['A4', 'A6', 'Q3', 'Q5', 'Q7', 'Q8', 'A3', 'A8 L', 'e-tron'],
  BMW: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'M340i', 'iX1', 'i4'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Freelander 2'],
  'Range Rover': ['Evoque', 'Velar', 'Range Rover Sport', 'Range Rover Vogue', 'Autobiography'],
  Jaguar: ['XF', 'XE', 'XJ', 'F-Pace', 'F-Type', 'I-Pace'],
  Volvo: ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'C40 Recharge', 'EX30'],
  Fiat: ['Punto', 'Linea', 'Avventura', 'Urban Cross', 'Palio', 'Abarth Punto', '500'],
  Mitsubishi: ['Pajero', 'Pajero Sport', 'Outlander', 'Lancer', 'Montero'],
  Citroen: ['C3', 'C3 Aircross', 'Basalt', 'C5 Aircross', 'eC3'],
  VinFast: ['VF 3', 'VF 6', 'VF 7', 'VF 8', 'VF 9', 'VF e34'],
  Chevrolet: ['Beat', 'Cruze', 'Spark', 'Sail', 'Enjoy', 'Tavera', 'Captiva', 'Trailblazer'],
  'Hindustan Motors': ['Ambassador', 'Contessa', 'Trekker'],
  JSW: ['Windsor EV', 'MG Windsor EV', 'Cloud EV', 'Cyberster', 'MG ZS EV'],
  BYD: ['Atto 3', 'Seal', 'e6', 'Sealion 7'],
  Isuzu: ['D-Max', 'D-Max V-Cross', 'mu-X', 'Hi-Lander'],
  'Force Motors': ['Gurkha', 'Trax Cruiser', 'Urbania'],
  Lexus: ['ES', 'NX', 'RX', 'LX', 'LM'],
  Mini: ['Cooper', 'Countryman', 'Cooper S', 'Cooper SE'],
  Porsche: ['Macan', 'Cayenne', 'Panamera', 'Taycan', '911'],
  Datsun: ['redi-GO', 'GO', 'GO+'],
};

export const VARIANTS_BY_MODEL: Record<string, string[]> = {
  // Hyundai
  'Creta': ['E', 'EX', 'S', 'S (O)', 'SX', 'SX Executive', 'SX (O)', 'SX (O) Turbo DCT', 'SX (O) Diesel AT', 'Knight Edition', 'N Line N8', 'N Line N10'],
  'Venue': ['E', 'S', 'S (O)', 'S+ (O)', 'SX', 'SX (O)', 'SX 1.0 Turbo DCT', 'SX (O) Turbo DCT', 'N Line N6', 'N Line N8', 'Executive'],
  'i20': ['Era', 'Magna', 'Sportz', 'Sportz (O)', 'Asta', 'Asta (O)', 'N Line N6', 'N Line N8', 'Active'],
  'Verna': ['EX', 'S', 'SX', 'SX (O)', 'SX Turbo', 'SX (O) Turbo DCT', 'SX (O) Diesel AT'],
  'Alcazar': ['Prestige', 'Platinum', 'Signature', 'Executive', 'Adventure Edition'],
  'Exter': ['EX', 'EX (O)', 'S', 'S (O)', 'SX', 'SX (O)', 'SX (O) Connect', 'Knight Edition'],
  'Tucson': ['Platinum AT', 'Signature AT', 'Signature 4WD AT', 'GLS 4WD'],
  'Aura': ['E', 'S', 'SX', 'SX (O)', 'SX Plus AMT', 'S CNG', 'SX CNG'],
  'Grand i10 Nios': ['Era', 'Magna', 'Sportz', 'Sportz Executive', 'Asta', 'Corporate Edition'],
  'Ioniq 5': ['Long Range RWD', 'AWD'],

  // Maruti Suzuki
  'Swift': ['LXi', 'VXi', 'VXi (O)', 'ZXi', 'ZXi Plus', 'ZXi Plus Dual Tone', 'LDi', 'VDi', 'ZDi', 'ZDi Plus', 'VXi AGS', 'ZXi AGS', 'ZXi Plus AGS'],
  'Baleno': ['Sigma', 'Delta', 'Zeta', 'Alpha', 'Delta AMT', 'Zeta AMT', 'Alpha AMT', 'RS 1.0 Turbo'],
  'Brezza': ['LXi', 'VXi', 'ZXi', 'ZXi Plus', 'ZXi Dual Tone', 'ZXi Plus Dual Tone', 'VXi AT', 'ZXi AT', 'ZXi Plus AT', 'LDi', 'VDi', 'ZDi'],
  'Dzire': ['LXi', 'VXi', 'ZXi', 'ZXi Plus', 'VXi AGS', 'ZXi AGS', 'ZXi Plus AGS', 'VXi CNG', 'ZXi CNG'],
  'Grand Vitara': ['Sigma', 'Delta', 'Zeta', 'Alpha', 'Zeta Plus Hybrid', 'Alpha Plus Hybrid', 'Alpha AWD AllGrip'],
  'Fronx': ['Sigma', 'Delta', 'Delta Plus', 'Zeta 1.0 Turbo', 'Alpha 1.0 Turbo', 'Velocity Edition', 'Delta CNG'],
  'Ertiga': ['LXi', 'VXi', 'ZXi', 'ZXi Plus', 'VXi AT', 'ZXi AT', 'ZXi Plus AT', 'VXi CNG', 'ZXi CNG'],
  'XL6': ['Zeta', 'Alpha', 'Alpha Plus', 'Alpha Plus Dual Tone', 'Zeta AT', 'Alpha AT'],
  'Jimny': ['Zeta', 'Alpha', 'Alpha Dual Tone', 'Alpha AT'],
  'Ciaz': ['Sigma', 'Delta', 'Zeta', 'Alpha', 'Alpha AT', 'S (Sport)'],
  'Wagon R': ['LXi', 'VXi', 'ZXi', 'ZXi Plus', 'LXi CNG', 'VXi CNG', 'VXi AGS', 'ZXi AGS'],
  'Alto K10': ['Std', 'LXi', 'VXi', 'VXi Plus', 'VXi CNG', 'VXi AGS'],
  'Ignis': ['Sigma', 'Delta', 'Zeta', 'Alpha', 'Delta AMT', 'Zeta AMT', 'Alpha AMT'],
  'Scross': ['Sigma', 'Delta', 'Zeta', 'Alpha', 'Zeta AT', 'Alpha AT'],
  'Celerio': ['LXi', 'VXi', 'ZXi', 'ZXi Plus', 'VXi CNG', 'ZXi AMT'],

  // Tata
  'Nexon': ['Smart', 'Smart Plus', 'Pure', 'Pure S', 'Creative', 'Creative Plus', 'Creative Plus S', 'Fearless', 'Fearless Plus', 'Fearless Plus S', 'Dark Edition', 'Red Dark', 'XZ Plus', 'XZA Plus'],
  'Nexon EV': ['Creative', 'Fearless', 'Empowered', 'Empowered Plus', 'Long Range', 'Dark Edition', 'Prime', 'Max'],
  'Punch': ['Pure', 'Adventure', 'Accomplished', 'Accomplished Dazzle', 'Creative', 'Creative Flagship', 'iCNG Adventure', 'iCNG Accomplished'],
  'Punch EV': ['Smart', 'Smart Plus', 'Adventure', 'Empowered', 'Empowered Plus'],
  'Harrier': ['Smart', 'Pure', 'Adventure', 'Adventure Plus', 'Fearless', 'Fearless Plus', 'Dark Edition', 'XZ Plus', 'XZA Plus'],
  'Safari': ['Smart', 'Pure', 'Adventure', 'Adventure Plus', 'Accomplished', 'Accomplished Plus', 'Dark Edition', 'Gold Edition', 'XZ Plus', 'XZA Plus'],
  'Altroz': ['XE', 'XM', 'XM Plus', 'XT', 'XZ', 'XZ Plus', 'XZA Plus', 'i-Turbo', 'Racer R1', 'Racer R2', 'Racer R3', 'Dark Edition'],
  'Tiago': ['XE', 'XT', 'XT (O)', 'XZ', 'XZ Plus', 'XZA Plus', 'XT iCNG', 'XZ Plus iCNG', 'NRG XT', 'NRG XZ'],
  'Tigor': ['XE', 'XM', 'XZ', 'XZ Plus', 'XZA Plus', 'iCNG XZ', 'iCNG XZ Plus'],
  'Curvv': ['Smart', 'Pure Plus', 'Creative', 'Creative Plus S', 'Accomplished', 'Accomplished Plus A'],

  // Mahindra
  'Thar': ['AX', 'AX (O)', 'LX Hard Top', 'LX Soft Top', 'LX 4x4 MT', 'LX 4x4 AT', 'RWD Petrol AT', 'RWD Diesel MT', 'Earth Edition', 'Roxx MX1', 'Roxx MX3', 'Roxx AX3L', 'Roxx AX5L', 'Roxx AX7L'],
  'XUV700': ['MX', 'AX3', 'AX5', 'AX5 Select', 'AX7', 'AX7 Luxury (AX7L)', 'AX7L AWD', 'Blaze Edition', 'Ebony Edition'],
  'Scorpio-N': ['Z2', 'Z4', 'Z6', 'Z8', 'Z8 Select', 'Z8 L', 'Z8 L 4x4', 'Z8 L AT'],
  'Scorpio Classic': ['S', 'S11', 'S11 7-Seater', 'S11 9-Seater', 'S9'],
  'XUV 3XO': ['MX1', 'MX2', 'MX2 Pro', 'MX3', 'MX3 Pro', 'AX5', 'AX5 Luxury', 'AX7', 'AX7 Luxury'],
  'XUV300': ['W4', 'W6', 'W8', 'W8 (O)', 'Turbosport W6', 'Turbosport W8', 'Turbosport W8 (O)'],
  'Bolero': ['B4', 'B6', 'B6 (O)', 'Power Plus'],
  'Bolero Neo': ['N4', 'N8', 'N10', 'N10 (O)', 'Limited Edition'],
  'XUV400 EV': ['EC Pro', 'EL Pro 34.5 kWh', 'EL Pro 39.4 kWh'],

  // Honda
  'City': ['SV', 'V', 'VX', 'ZX', 'e:HEV Hybrid V', 'e:HEV Hybrid ZX', 'Elegant Edition', 'V CVT', 'VX CVT', 'ZX CVT'],
  'Amaze': ['E', 'S', 'VX', 'Elite Edition', 'S CVT', 'VX CVT'],
  'Elevate': ['SV', 'V', 'VX', 'ZX', 'Black Edition', 'Apex Edition', 'V CVT', 'VX CVT', 'ZX CVT'],
  'WR-V': ['SV', 'V', 'VX', 'Edge Edition'],
  'Jazz': ['V', 'VX', 'ZX', 'V CVT', 'VX CVT', 'ZX CVT'],
  'Civic': ['V', 'VX', 'ZX', 'ZX Diesel'],

  // Toyota
  'Fortuner': ['4x2 MT Petrol', '4x2 AT Petrol', '4x2 MT Diesel', '4x2 AT Diesel', '4x4 MT Diesel', '4x4 AT Diesel', 'Legender 4x2 AT', 'Legender 4x4 AT', 'GR Sport 4x4 AT'],
  'Innova Crysta': ['GX', 'GX Plus', 'VX', 'ZX', 'Tour M', 'GX AT', 'ZX AT'],
  'Innova Hycross': ['G', 'GX', 'GX (O)', 'VX Hybrid', 'VX (O) Hybrid', 'ZX Hybrid', 'ZX (O) Hybrid'],
  'Urban Cruiser Hyryder': ['E', 'S', 'G', 'V', 'S Hybrid', 'G Hybrid', 'V Hybrid', 'V AWD AllGrip'],
  'Glanza': ['E', 'S', 'G', 'V', 'S AMT', 'G AMT', 'V AMT', 'S CNG', 'G CNG'],
  'Camry': ['Hybrid 2.5', 'Elegance', 'Luxury'],
  'Hilux': ['Standard MT', 'High MT', 'High AT'],

  // Kia
  'Seltos': ['HTE', 'HTK', 'HTK Plus', 'HTX', 'HTX Plus', 'GTX Plus', 'X-Line', 'Gravity Edition'],
  'Sonet': ['HTE', 'HTK', 'HTK Plus', 'HTX', 'HTX Plus', 'GTX Plus', 'X-Line'],
  'Carens': ['Premium', 'Prestige', 'Prestige Plus', 'Luxury', 'Luxury Plus', 'X-Line'],
  'Carnival': ['Prestige', 'Limousine', 'Limousine Plus'],
  'EV6': ['GT Line RWD', 'GT Line AWD'],

  // Volkswagen
  'Virtus': ['Comfortline', 'Highline', 'Topline', 'GT', 'GT Plus', 'GT Edge', 'Sound Edition'],
  'Taigun': ['Comfortline', 'Highline', 'Topline', 'GT', 'GT Plus', 'GT Edge', 'Trail Edition'],
  'Polo': ['Trendline', 'Comfortline', 'Highline Plus', 'GT TSI', 'Legend'],
  'Vento': ['Trendline', 'Comfortline', 'Highline', 'Highline Plus', 'Highline Plus AT'],
  'Tiguan': ['Elegance 2.0 TSI', 'Exclusive Edition'],

  // Skoda
  'Slavia': ['Classic', 'Signature', 'Prestige', 'Active', 'Ambition', 'Style', 'Monte Carlo', 'Sportline'],
  'Kushaq': ['Classic', 'Signature', 'Prestige', 'Active', 'Ambition', 'Style', 'Monte Carlo', 'Onyx', 'Sportline'],
  'Octavia': ['Ambition', 'Style', 'L&K (Laurin & Klement)', 'vRS'],
  'Superb': ['Sportline', 'L&K (Laurin & Klement)'],
  'Kodiaq': ['Style', 'Sportline', 'L&K (Laurin & Klement)'],
  'Rapid': ['Rider', 'Rider Plus', 'Ambition', 'Onyx', 'Style', 'Monte Carlo'],

  // MG
  'Hector': ['Style', 'Shine', 'Smart', 'Smart Pro', 'Sharp Pro', 'Savvy Pro', 'Blackstorm'],
  'Hector Plus': ['Style', 'Shine Pro', 'Select Pro', 'Smart Pro', 'Sharp Pro', 'Savvy Pro'],
  'ZS EV': ['Executive', 'Excite', 'Exclusive', 'Exclusive Plus', 'Essence'],
  'Astor': ['Sprint', 'Shine', 'Select', 'Smart', 'Sharp', 'Savvy', 'Blackstorm'],
  'Comet EV': ['Executive', 'Excite', 'Exclusive', 'Gamer Edition', '100-Year Edition'],
  'Windsor EV': ['Excite', 'Exclusive', 'Essence'],
  'Gloster': ['Super', 'Sharp', 'Savvy', 'Blackstorm', 'Desertstorm'],

  // BMW
  '3 Series': ['330i M Sport', '320d Luxury Line', 'M340i xDrive', 'Gran Limousine 330Li', 'Gran Limousine 320Ld'],
  '5 Series': ['520d Luxury Line', '530i M Sport', '530d M Sport', '520d M Sport', '530Li Long Wheelbase'],
  'X1': ['sDrive18i xLine', 'sDrive18d M Sport', 'sDrive20i M Sport'],
  'X3': ['xDrive20d Luxury Line', 'xDrive30i M Sport', 'M40i'],
  'X5': ['xDrive40i xLine', 'xDrive40i M Sport', 'xDrive30d xLine', 'xDrive30d M Sport'],

  // Mercedes-Benz
  'C-Class': ['C 200', 'C 220d', 'C 300 AMG Line'],
  'E-Class': ['E 200 Exclusive', 'E 220d Exclusive', 'E 350d Elite', 'AMG Line'],
  'GLA': ['GLA 200', 'GLA 220d 4MATIC', 'AMG GLA 35 4MATIC'],
  'GLC': ['GLC 300 4MATIC', 'GLC 220d 4MATIC'],

  // Audi
  'A4': ['Premium', 'Premium Plus', 'Technology'],
  'A6': ['Premium Plus', 'Technology'],
  'Q3': ['Premium', 'Premium Plus', 'Technology', 'Sportback'],
  'Q5': ['Premium Plus', 'Technology', 'Special Edition'],
  'Q7': ['Premium Plus', 'Technology'],
  'Q8': ['Standard', 'Celebration Edition'],

  // Jeep
  'Compass': ['Sport', 'Longitude', 'Longitude (O)', 'Night Eagle', 'Limited', 'Limited (O)', 'Model S', 'Trailhawk'],
  'Meridian': ['Longitude', 'Longitude Plus', 'Limited (O)', 'Overland'],
  'Wrangler': ['Unlimited', 'Rubicon'],

  // Renault
  'Kwid': ['RXE', 'RXL', 'RXL (O)', 'RXT', 'Climber'],
  'Triber': ['RXE', 'RXL', 'RXT', 'RXZ'],
  'Kiger': ['RXE', 'RXL', 'RXT', 'RXT (O)', 'RXZ', 'RXZ Turbo'],

  // Nissan
  'Magnite': ['Visia', 'Visia Plus', 'Acenta', 'N-Connecta', 'Tekna', 'Tekna Plus', 'Geza Edition', 'Kuro Edition'],

  // Citroen
  'C3': ['Live', 'Feel', 'Feel (O)', 'Shine', 'Shine Turbo'],
  'Basalt': ['You', 'Plus', 'Max'],
  'C3 Aircross': ['You', 'Plus', 'Max'],
};

export const BRAND_DEFAULT_VARIANTS: Record<string, string[]> = {
  'Hyundai': ['E', 'EX', 'S', 'S (O)', 'SX', 'SX (O)', 'Knight Edition', 'N Line'],
  'Maruti Suzuki': ['LXi', 'VXi', 'ZXi', 'ZXi Plus', 'Sigma', 'Delta', 'Zeta', 'Alpha'],
  'Tata': ['Smart', 'Pure', 'Creative', 'Fearless', 'Accomplished', 'Empowered', 'Dark Edition'],
  'Mahindra': ['Base', 'MX', 'AX', 'LX', 'AX5', 'AX7', 'AX7 Luxury', 'Z4', 'Z8', 'Z8 L', 'S11'],
  'Honda': ['E', 'SV', 'V', 'VX', 'ZX', 'e:HEV Hybrid'],
  'Toyota': ['E', 'S', 'G', 'V', 'GX', 'VX', 'ZX', 'Legender', 'GR Sport'],
  'Kia': ['HTE', 'HTK', 'HTK Plus', 'HTX', 'HTX Plus', 'GTX Plus', 'X-Line'],
  'Volkswagen': ['Comfortline', 'Highline', 'Topline', 'GT', 'GT Plus'],
  'Skoda': ['Classic', 'Signature', 'Prestige', 'Active', 'Ambition', 'Style', 'Monte Carlo'],
  'MG': ['Style', 'Shine', 'Smart', 'Sharp', 'Savvy', 'Blackstorm'],
  'BMW': ['Sport Line', 'Luxury Line', 'M Sport', 'xDrive'],
  'Mercedes-Benz': ['Progressive', 'Executive', 'Exclusive', 'AMG Line', '4MATIC'],
  'Audi': ['Standard', 'Premium', 'Premium Plus', 'Technology'],
  'Jeep': ['Sport', 'Longitude', 'Limited', 'Model S', 'Trailhawk'],
  'Renault': ['RXE', 'RXL', 'RXT', 'RXZ', 'Climber'],
  'Nissan': ['Visia', 'Acenta', 'N-Connecta', 'Tekna', 'Tekna Plus'],
  'Citroen': ['Live', 'Feel', 'Shine', 'You', 'Plus', 'Max'],
};

export function getVariantsForMakeAndModel(make?: string | null, model?: string | null): string[] {
  const cleanMake = (make || '').trim();
  const cleanModel = (model || '').trim();

  // 1. Direct exact or case-insensitive match on model name
  if (cleanModel) {
    const directMatch = Object.keys(VARIANTS_BY_MODEL).find(
      (m) => m.toLowerCase() === cleanModel.toLowerCase()
    );
    if (directMatch && VARIANTS_BY_MODEL[directMatch]?.length) {
      return VARIANTS_BY_MODEL[directMatch];
    }

    // 2. Substring match (e.g. "Creta 1.5" matches "Creta", "Swift VXI" matches "Swift")
    const subMatch = Object.keys(VARIANTS_BY_MODEL).find(
      (m) => cleanModel.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(cleanModel.toLowerCase())
    );
    if (subMatch && VARIANTS_BY_MODEL[subMatch]?.length) {
      return VARIANTS_BY_MODEL[subMatch];
    }
  }

  // 3. Fallback to Brand Default Variants
  if (cleanMake) {
    const brandMatch = Object.keys(BRAND_DEFAULT_VARIANTS).find(
      (b) => b.toLowerCase() === cleanMake.toLowerCase()
    );
    if (brandMatch && BRAND_DEFAULT_VARIANTS[brandMatch]?.length) {
      return BRAND_DEFAULT_VARIANTS[brandMatch];
    }
  }

  // 4. Universal Fallback
  return ['Standard', 'Base', 'Mid', 'Top', 'VXi / SX / VX', 'ZXi / SX (O) / ZX', 'Highline / Style / Luxury'];
}

export const INITIAL_CARS: Car[] = [
  {
    id: 'recars-101',
    make: 'Hyundai',
    model: 'Creta',
    variant: 'SX (O) 1.5 Turbo Petrol DCT',
    year: 2022,
    price: 1250000,
    originalPrice: 1320000,
    emiPerMonth: 26230,
    kilometers: 32000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownership: '1st Owner',
    city: 'Warangal',
    locationArea: 'Hanamkonda Recars Hub',
    image: '/car-creta-hd.jpg',
    galleryImages: [
      '/car-creta-hd.jpg',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
    ],
    isVerified: true,
    isRecarsSelect: true,
    featured: true,
    inspectionScore: 97,
    specifications: {
      engine: '1497 cc, 4 Cylinders Inline',
      maxPower: '113 bhp @ 6300 rpm',
      torque: '144 Nm @ 4500 rpm',
      mileage: '16.8 kmpl',
      seatingCapacity: 5,
      bootSpace: '433 Litres',
      fuelTankCapacity: '50 Litres',
      groundClearance: '190 mm',
      rto: 'TS-03 (Warangal)',
      regYear: 2022,
      insuranceValidTill: 'Oct 2027 (Comprehensive)',
      color: 'Titan Grey Metallic'
    },
    features: [
      'Panoramic Sunroof',
      'Ventilated Front Seats',
      '10.25-inch Touchscreen Infotainment',
      'Bose Premium 8-Speaker Audio',
      'Wireless Smartphone Charger',
      'Electronic Parking Brake with Auto Hold',
      'BlueLink Connected Car Tech',
      '6 Airbags & ESP'
    ],
    description: 'Immaculately maintained single-owner Hyundai Creta SX (O) with complete authorised service history. Pristine interior, non-accidental guarantee, 4 brand new Michelin tyres, and valid comprehensive insurance.',
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'recars-102',
    make: 'Honda',
    model: 'City',
    variant: 'ZX 1.5 i-VTEC CVT',
    year: 2021,
    price: 980000,
    originalPrice: 1040000,
    emiPerMonth: 20560,
    kilometers: 28000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    ownership: '1st Owner',
    city: 'Warangal',
    locationArea: 'Kazipet Recars Hub',
    image: '/car-city-hd.jpg',
    galleryImages: [
      '/car-city-hd.jpg',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541348263662-e0c866c24385?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80'
    ],
    isVerified: true,
    isRecarsSelect: true,
    featured: true,
    inspectionScore: 98,
    specifications: {
      engine: '1498 cc, 4 Cylinders DOHC i-VTEC',
      maxPower: '119 bhp @ 6600 rpm',
      torque: '145 Nm @ 4300 rpm',
      mileage: '18.4 kmpl',
      seatingCapacity: 5,
      bootSpace: '506 Litres',
      fuelTankCapacity: '40 Litres',
      groundClearance: '165 mm',
      rto: 'TS-03 (Warangal)',
      regYear: 2021,
      insuranceValidTill: 'Dec 2026',
      color: 'Platinum White Pearl'
    },
    features: [
      'Electric Sunroof',
      'LaneWatch Camera Blind Spot Assist',
      'Full LED Headlamps with 9 LED Array',
      'Leatherette Upholstery',
      'Apple CarPlay & Android Auto',
      'Cruise Control',
      'Paddle Shifters'
    ],
    description: 'Top-of-the-line 5th Gen Honda City ZX CVT with smooth automatic gearbox, legendary i-VTEC responsiveness, and luxurious legroom. Clean single corporate owner with zero claims history.',
    createdAt: '2026-10-02T12:00:00Z'
  },
  {
    id: 'recars-103',
    make: 'Toyota',
    model: 'Fortuner',
    variant: '2.8 4x4 Automatic Diesel',
    year: 2020,
    price: 2890000,
    originalPrice: 3000000,
    emiPerMonth: 60650,
    kilometers: 45000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownership: '1st Owner',
    city: 'Warangal',
    locationArea: 'Subedari Recars Hub',
    image: '/car-fortuner-hd.jpg',
    galleryImages: [
      '/car-fortuner-hd.jpg',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'
    ],
    isVerified: true,
    isRecarsSelect: true,
    featured: true,
    inspectionScore: 96,
    specifications: {
      engine: '2755 cc, 4 Cylinders DOHC 1GD-FTV',
      maxPower: '201 bhp @ 3400 rpm',
      torque: '500 Nm @ 1600-2800 rpm',
      mileage: '14.2 kmpl',
      seatingCapacity: 7,
      bootSpace: '296 Litres (Expandable)',
      fuelTankCapacity: '80 Litres',
      groundClearance: '225 mm',
      rto: 'TS-03 (Warangal)',
      regYear: 2020,
      insuranceValidTill: 'August 2027',
      color: 'Attitude Black'
    },
    features: [
      'Electronic 4x4 with High/Low Range',
      'Downhill Assist Control & Auto LSD',
      'JBL 11-Speaker Audio System',
      'Electrically Adjustable Ventilated Seats',
      'Powered Tailgate with Kick Sensor',
      '7 Airbags & Vehicle Stability Control'
    ],
    description: 'Formidable Toyota Fortuner 4x4 Automatic built for indestructible endurance. Meticulously maintained at official Toyota dealership with unblemished paintwork, robust chassis condition, and unmatched road presence.',
    createdAt: '2026-10-03T09:30:00Z'
  },
  {
    id: 'recars-104',
    make: 'Kia',
    model: 'Seltos',
    variant: 'HTX Plus 1.5 Petrol IVT',
    year: 2022,
    price: 1350000,
    originalPrice: 1420000,
    emiPerMonth: 28330,
    kilometers: 30000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'SUV',
    ownership: '1st Owner',
    city: 'Warangal',
    locationArea: 'Hanamkonda Recars Hub',
    image: '/car-seltos-hd.jpg',
    galleryImages: [
      '/car-seltos-hd.jpg',
      'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
    ],
    isVerified: true,
    isRecarsSelect: true,
    featured: true,
    inspectionScore: 97,
    specifications: {
      engine: '1497 cc, Smartstream G1.5',
      maxPower: '113 bhp @ 6300 rpm',
      torque: '144 Nm @ 4500 rpm',
      mileage: '16.5 kmpl',
      seatingCapacity: 5,
      bootSpace: '433 Litres',
      fuelTankCapacity: '50 Litres',
      groundClearance: '190 mm',
      rto: 'TS-03 (Warangal)',
      regYear: 2022,
      insuranceValidTill: 'Nov 2026',
      color: 'Glacier White Pearl'
    },
    features: [
      'Smart Pure Air Purifier with UV Sterilization',
      'Bose Sound System with Ambient Mood Lighting',
      '10.25-inch HD Touchscreen with Navigation',
      'Kia Connect with 60+ Smart Features',
      'LED Ice Cube Fog Lamps',
      'Rear Reclining Seats'
    ],
    description: 'Sporty and modern Kia Seltos HTX Plus IVT with ultra-refined CVT transmission, striking tiger-nose styling, air purification, and connected telematics. Flawlessly serviced on schedule.',
    createdAt: '2026-10-04T15:00:00Z'
  },
  {
    id: 'recars-105',
    make: 'Tata',
    model: 'Nexon EV',
    variant: 'Empowered Plus 45 kWh Long Range',
    year: 2023,
    price: 1380000,
    originalPrice: 1490000,
    emiPerMonth: 28960,
    kilometers: 18000,
    fuelType: 'Electric',
    transmission: 'Automatic',
    bodyType: 'Electric',
    ownership: '1st Owner',
    city: 'Warangal',
    locationArea: 'Naimnagar Recars Hub',
    image: '/car-nexon-hd.jpg',
    galleryImages: [
      '/car-nexon-hd.jpg',
      'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80'
    ],
    isVerified: true,
    isRecarsSelect: true,
    featured: true,
    inspectionScore: 99,
    specifications: {
      engine: 'Permanent Magnet Synchronous Motor',
      maxPower: '143 bhp',
      torque: '215 Nm',
      mileage: '465 km Range (ARAI Certified)',
      seatingCapacity: 5,
      bootSpace: '350 Litres',
      fuelTankCapacity: '45 kWh Battery Pack',
      groundClearance: '190 mm',
      rto: 'TS-03 (Warangal)',
      regYear: 2023,
      insuranceValidTill: 'May 2028',
      color: 'Empowered Oxide Dual Tone'
    },
    features: [
      'V2V & V2L Vehicle to Load Charging',
      '12.3-inch Cinematic Cinematic Touchscreen',
      'Arcade.ev App Suite with OTT streaming',
      'Ventilated Seats & 360-degree HD Camera',
      'Blind Spot View Monitor',
      'Fast DC 50kW Charging (10-80% in 40 mins)'
    ],
    description: 'Future-ready electric mobility with Tata Nexon EV Long Range. Minimal running cost (₹1.1/km), 8-year battery warranty intact, exceptional regenerative braking, and unmatched city acceleration.',
    createdAt: '2026-10-05T08:00:00Z'
  },
  {
    id: 'recars-106',
    make: 'BMW',
    model: '3 Series',
    variant: '330i M Sport Steptronic',
    year: 2021,
    price: 3650000,
    originalPrice: 3850000,
    emiPerMonth: 76600,
    kilometers: 22000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'Luxury',
    ownership: '1st Owner',
    city: 'Warangal',
    locationArea: 'Hunter Road Recars Hub',
    image: '/car-bmw-hd.jpg',
    galleryImages: [
      '/car-bmw-hd.jpg',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'
    ],
    isVerified: true,
    isRecarsSelect: true,
    featured: true,
    inspectionScore: 98,
    specifications: {
      engine: '1998 cc, BMW TwinPower Turbo 4-Cylinder',
      maxPower: '255 bhp @ 5000 rpm',
      torque: '400 Nm @ 1550-4400 rpm',
      mileage: '16.1 kmpl',
      seatingCapacity: 5,
      bootSpace: '480 Litres',
      fuelTankCapacity: '59 Litres',
      groundClearance: '141 mm',
      rto: 'TS-03 (Warangal)',
      regYear: 2021,
      insuranceValidTill: 'March 2027',
      color: 'Portimao Blue Metallic'
    },
    features: [
      'M Aerodynamics Package & M Sport Brakes',
      'BMW Live Cockpit Professional with Navigation',
      'Harman Kardon Surround Sound 16-Speakers',
      'Wireless Apple CarPlay / Android Auto',
      'Reversing Assistant & Park Distance Control',
      'Cognac Vernasca Leather Upholstery'
    ],
    description: 'The definitive sports luxury sedan. BMW 330i M Sport delivers exhilarating 0-100 km/h in 5.8s with razor-sharp steering and supreme luxury craftsmanship. Complete BMW BSI service package verified.',
    createdAt: '2026-10-06T11:00:00Z'
  },
  {
    id: 'recars-107',
    make: 'Maruti Suzuki',
    model: 'Swift',
    variant: 'ZXi Plus AMT Dual Tone',
    year: 2022,
    price: 640000,
    originalPrice: 680000,
    emiPerMonth: 13430,
    kilometers: 21000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    bodyType: 'Hatchback',
    ownership: '1st Owner',
    city: 'Warangal',
    locationArea: 'Warangal Chowrasta Hub',
    image: '/car-swift-hd.jpg',
    galleryImages: [
      '/car-swift-hd.jpg',
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
    ],
    isVerified: true,
    isRecarsSelect: false,
    featured: false,
    inspectionScore: 95,
    specifications: {
      engine: '1197 cc, DualJet Dual VVT K-Series',
      maxPower: '89 bhp @ 6000 rpm',
      torque: '113 Nm @ 4400 rpm',
      mileage: '22.56 kmpl',
      seatingCapacity: 5,
      bootSpace: '268 Litres',
      fuelTankCapacity: '37 Litres',
      groundClearance: '163 mm',
      rto: 'TS-03 (Warangal)',
      regYear: 2022,
      insuranceValidTill: 'July 2027',
      color: 'Solid Fire Red with Pearl Arctic White'
    },
    features: [
      'SmartPlay Pro+ 7-inch Touchscreen',
      'Cruise Control & Auto Climate Control',
      'Precision Cut Two-Tone Alloy Wheels',
      'Push Button Start/Stop with Smart Key',
      'Hill Hold Assist & Electronic Stability Program'
    ],
    description: 'India\'s favorite peppy hatchback in pristine condition. Unmatched fuel economy exceeding 22 kmpl, effortless automatic driving in city traffic, low maintenance, and high resale value.',
    createdAt: '2026-10-07T14:15:00Z'
  },
  {
    id: 'recars-108',
    make: 'Toyota',
    model: 'Innova Crysta',
    variant: '2.4 ZX 7 STR Automatic Diesel',
    year: 2021,
    price: 1980000,
    originalPrice: 2090000,
    emiPerMonth: 41550,
    kilometers: 49000,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'MUV',
    ownership: '1st Owner',
    city: 'Warangal',
    locationArea: 'Kakatiya University Hub',
    image: '/car-innova-hd.jpg',
    galleryImages: [
      '/car-innova-hd.jpg',
      'https://images.unsplash.com/photo-1541348263662-e0c866c24385?auto=format&fit=crop&w=1200&q=80'
    ],
    isVerified: true,
    isRecarsSelect: true,
    featured: false,
    inspectionScore: 97,
    specifications: {
      engine: '2393 cc, 4 Cylinders Inline DOHC',
      maxPower: '148 bhp @ 3400 rpm',
      torque: '360 Nm @ 1400-2600 rpm',
      mileage: '15.1 kmpl',
      seatingCapacity: 7,
      bootSpace: '300 Litres',
      fuelTankCapacity: '55 Litres',
      groundClearance: '178 mm',
      rto: 'TS-03 (Warangal)',
      regYear: 2021,
      insuranceValidTill: 'Jan 2027',
      color: 'Garnet Red Metallic'
    },
    features: [
      'Second Row Executive Captain Seats with Armrest',
      'Premium Hazel Brown Perforated Leather Upholstery',
      'Ambient Roof Illumination',
      '8-inch Audio System with Navigation',
      'Eco & Power Drive Modes',
      '7 SRS Airbags'
    ],
    description: 'The gold standard of family travel. Innova Crysta ZX 7-Seater offers first-class airline comfort on every highway trip, bomb-proof Toyota reliability, and pristine cabin ergonomics.',
    createdAt: '2026-10-08T16:00:00Z'
  }
];

export const TRUST_BENEFITS = [
  { id: 1, title: '28+ Point Inspection', desc: 'Rigorous engineering check with detailed digital report', icon: 'shield-check' },
  { id: 2, title: 'Verified Documents', desc: '100% legal title, RTO records and verified ownership history', icon: 'file-check' },
  { id: 3, title: 'Transparent Pricing', desc: 'Data-driven fair pricing with interactive price negotiations', icon: 'currency-inr' },
  { id: 4, title: 'Recars Certified Quality', desc: 'Strict mechanical, electrical, and structural evaluation standards', icon: 'shield-check' },
  { id: 5, title: 'Easy Financing', desc: 'Competitive loan partnerships with top banks subject to approval', icon: 'credit-card' },
  { id: 6, title: 'RC Transfer Assistance', desc: 'Doorstep RTO documentation and title transfer support (RTO charges to be paid by client)', icon: 'file-text' },
  { id: 7, title: 'Dedicated Support', desc: 'Personal relationship manager from vehicle enquiry to handover', icon: 'headset' },
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Find or List',
    desc: 'Search for your dream car or list your car in minutes.',
    icon: 'search',
  },
  {
    step: '02',
    title: 'Inspection',
    desc: 'We inspect and verify the vehicle and documents.',
    icon: 'clipboard-check',
  },
  {
    step: '03',
    title: 'Transact',
    desc: 'Get the best price with secure payment options.',
    icon: 'handshake',
  },
  {
    step: '04',
    title: 'Drive Away',
    desc: 'Complete paperwork and start your journey.',
    icon: 'car',
  },
];
