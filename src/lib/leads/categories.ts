export const CATEGORIES = {
  salon: {
    label: "Salons and spas",
    filters: ['nwr["shop"~"^(hairdresser|beauty)$"]', 'nwr["amenity"~"^(beauty|spa)$"]'],
  },
  health: {
    label: "Clinics and dentists",
    filters: ['nwr["amenity"~"^(dentist|clinic|doctors|pharmacy|veterinary)$"]'],
  },
  auto: {
    label: "Garages and car services",
    filters: [
      'nwr["shop"~"^(car_repair|car|tyres|car_parts)$"]',
      'nwr["amenity"~"^(car_wash|car_rental|driving_school)$"]',
    ],
  },
  food: {
    label: "Restaurants and bars",
    filters: ['nwr["amenity"~"^(restaurant|cafe|bar|pub|fast_food)$"]'],
  },
  stay: {
    label: "Hotels and guest houses",
    filters: ['nwr["tourism"~"^(hotel|guest_house|hostel)$"]'],
  },
  fitness: {
    label: "Gyms",
    filters: ['nwr["leisure"~"^(fitness_centre|sports_centre)$"]'],
  },
  shops: { label: "Other shops", filters: ['nwr["shop"]'] },
  services: { label: "Offices and trades", filters: ['nwr["office"]', 'nwr["craft"]'] },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as [CategoryKey, ...CategoryKey[]];

const TYPE_LABELS: Record<string, string> = {
  hairdresser: "Hair salon",
  beauty: "Beauty salon",
  spa: "Spa",
  dentist: "Dental clinic",
  clinic: "Clinic",
  doctors: "Clinic",
  pharmacy: "Pharmacy",
  veterinary: "Vet clinic",
  car_repair: "Garage",
  car: "Car dealer",
  tyres: "Tyre shop",
  car_parts: "Car parts shop",
  car_wash: "Car wash",
  car_rental: "Car hire",
  driving_school: "Driving school",
  restaurant: "Restaurant",
  cafe: "Cafe",
  bar: "Bar",
  pub: "Pub",
  fast_food: "Fast food",
  hotel: "Hotel",
  guest_house: "Guest house",
  hostel: "Hostel",
  fitness_centre: "Gym",
  sports_centre: "Sports centre",
};

/** A readable business type from OpenStreetMap tags, for example "Dental clinic". */
export function typeLabel(tags: Record<string, string>): string {
  for (const key of ["amenity", "shop", "tourism", "leisure", "craft", "office"]) {
    const value = tags[key];
    if (!value) continue;
    if (TYPE_LABELS[value]) return TYPE_LABELS[value];
    const words = value.replace(/[_;]/g, " ").trim();
    const base = words.charAt(0).toUpperCase() + words.slice(1);
    if (key === "shop") return value === "yes" ? "Shop" : `${base} shop`;
    if (key === "office") return value === "yes" ? "Office" : `${base} office`;
    return base;
  }
  return "Business";
}
