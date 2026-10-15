import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/* ─── cities ──────────────────────────────────────────────────────── */
export const cities = sqliteTable("cities", {
  id:           integer("id").primaryKey({ autoIncrement: true }),
  name:         text("name").notNull(),
  slug:         text("slug").notNull().unique(),
  lat:          real("lat").notNull(),
  lng:          real("lng").notNull(),
  clinicCount:  integer("clinic_count").notNull().default(0),
});

/* ─── categories ──────────────────────────────────────────────────── */
export const categories = sqliteTable("categories", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  name:        text("name").notNull(),
  slug:        text("slug").notNull().unique(),
  description: text("description"),
});

/* ─── clinics ─────────────────────────────────────────────────────── */
export const clinics = sqliteTable("clinics", {
  id:         integer("id").primaryKey({ autoIncrement: true }),
  name:       text("name").notNull(),
  slug:       text("slug").notNull().unique(),
  cityId:     integer("city_id").notNull().references(() => cities.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  brandId:    integer("brand_id").references(() => brands.id),
  branchSlug: text("branch_slug"),

  // Display names
  nameEn: text("name_en"),   // English name — used for slug generation
  nameTh: text("name_th"),   // Thai name — displayed on page if present

  // Location
  address:    text("address"),
  district:   text("district"),
  postalCode: text("postal_code"),
  lat:        real("lat").notNull(),
  lng:        real("lng").notNull(),

  // Contact
  phone:   text("phone"),
  website: text("website"),
  email:   text("email"),

  // Google
  googlePlaceId:      text("google_place_id").unique(),
  cid:                text("cid"),               // Google Maps CID — for /maps?cid= links
  googleRating:       real("google_rating"),
  googleReviewsCount: integer("google_reviews_count"),

  // Filters
  englishSpeaking: integer("english_speaking", { mode: "boolean" }).default(false),
  nearBts:         integer("near_bts",         { mode: "boolean" }).default(false),
  nearMrt:         integer("near_mrt",         { mode: "boolean" }).default(false),
  openWeekends:         integer("open_weekends",         { mode: "boolean" }).default(false),
  hasParking:           integer("has_parking",           { mode: "boolean" }).default(false),
  wheelchairAccessible: integer("wheelchair_accessible", { mode: "boolean" }).default(false),
  appointmentRequired:  integer("appointment_required",  { mode: "boolean" }).default(false),
  acceptsCard:          integer("accepts_card",          { mode: "boolean" }).default(false),
  acceptsNfc:           integer("accepts_nfc",           { mode: "boolean" }).default(false),
  openLate:             integer("open_late",             { mode: "boolean" }).default(false),
  verified:             integer("verified",              { mode: "boolean" }).default(false),
  featured:        integer("featured",         { mode: "boolean" }).default(false),
  featuredPosition: integer("featured_position"),
  tier: text("tier").notNull().default("basic"),
  topRated: integer("top_rated", { mode: "boolean" }).notNull().default(false),

  // Content
  about:        text("about"),    // JSON with amenities/accessibility
  services:     text("services"),
  languages:    text("languages"),
  openingHours: text("opening_hours"), // JSON: {"Monday":"9AM-8PM",...}
  photoUrl:     text("photo_url"),

  // AI review summary
  reviewPositives:        text("review_positives"),        // JSON array of strings/nulls
  reviewNegatives:        text("review_negatives"),        // JSON array of strings/nulls
  reviewSummaryCount:     integer("review_summary_count"),
  reviewSummaryUpdatedAt: text("review_summary_updated_at"), // ISO date YYYY-MM-DD

  // Timestamps
  createdAt:      text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt:      text("updated_at").notNull().default(sql`(datetime('now'))`),
  lastVerifiedAt: text("last_verified_at"),
});

/* ─── brands ──────────────────────────────────────────────────────── */
export const brands = sqliteTable("brands", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  name:        text("name").notNull(),
  slug:        text("slug").notNull(),
  cityId:      integer("city_id").notNull().references(() => cities.id),
  categoryId:  integer("category_id").notNull().references(() => categories.id),
  about:       text("about"),
  website:     text("website"),
  logoUrl:     text("logo_url"),
  branchCount:  integer("branch_count").notNull().default(0),
  avgRating:    real("avg_rating"),
  totalReviews: integer("total_reviews").notNull().default(0),
  featured:         integer("featured", { mode: "boolean" }).default(false),
  featuredPosition: integer("featured_position"),  // pin order in listing (nullable)
  tier: text("tier").notNull().default("basic"),
  topRated: integer("top_rated", { mode: "boolean" }).notNull().default(false),
  editorsNote:      text("editors_note"),   // Editor's Pick editorial copy (nullable)
  createdAt:   text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt:   text("updated_at").notNull().default(sql`(datetime('now'))`),
}, (t) => ({
  brandSlugUnique: uniqueIndex("brands_city_cat_slug_unq").on(t.cityId, t.categoryId, t.slug),
}));

/* ─── clinic_reviews ──────────────────────────────────────────────── */
export const clinicReviews = sqliteTable("clinic_reviews", {
  id:            integer("id").primaryKey({ autoIncrement: true }),
  clinicId:      integer("clinic_id").notNull().references(() => clinics.id),
  googleReviewId: text("google_review_id").unique(),
  authorName:    text("author_name").notNull(),
  rating:        integer("rating").notNull(),  // 1-5
  text:          text("text"),
  reviewDate:    text("review_date"),          // date string
  createdAt:     text("created_at").notNull().default(sql`(datetime('now'))`),
});

/* ─── transit_stations ────────────────────────────────────────────── */
// Bangkok rail stations (BTS, MRT incl. Yellow/Pink monorail, ARL, SRT Red).
// Source: OpenStreetMap, snapshot in data/transit-stations.json.
export const transitStations = sqliteTable("transit_stations", {
  id:     integer("id").primaryKey({ autoIncrement: true }),
  osmId:  integer("osm_id").notNull().unique(),
  name:   text("name").notNull(),      // English, e.g. "Asok"
  nameTh: text("name_th"),
  system: text("system").notNull(),    // "BTS" | "MRT" | "ARL" | "SRT Red Line"
  lat:    real("lat").notNull(),
  lng:    real("lng").notNull(),
});

/* ─── clinic_stations ─────────────────────────────────────────────── */
// Up to 2 nearest stations within 1 km, straight-line distance.
// Rebuilt by scripts/enrich-transit.ts.
export const clinicStations = sqliteTable("clinic_stations", {
  clinicId:  integer("clinic_id").notNull().references(() => clinics.id),
  stationId: integer("station_id").notNull().references(() => transitStations.id),
  distanceM: integer("distance_m").notNull(),
}, (t) => ({
  clinicStationUnique: uniqueIndex("clinic_stations_unq").on(t.clinicId, t.stationId),
}));

/* ─── treatment_prices ────────────────────────────────────────────── */
// Prices clinics publish themselves. Source of truth: data/prices.csv,
// loaded by scripts/import-prices.ts (replace-all). Chain-wide prices set
// brand_id and apply to every branch; otherwise clinic_id is set.
export const treatmentPrices = sqliteTable("treatment_prices", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  clinicId:    integer("clinic_id").references(() => clinics.id),
  brandId:     integer("brand_id").references(() => brands.id),
  treatment:   text("treatment").notNull(),   // "botox" | "dermal-filler" | "ulthera" | …
  product:     text("product"),               // "Allergan", "Juvederm Voluma"…
  priceThb:    integer("price_thb").notNull(),
  priceMaxThb: integer("price_max_thb"),
  unit:        text("unit").notNull(),        // "unit" | "vial" | "area" | "cc" | "ml" | "lines" | "session" | "syringe"
  quantity:    real("quantity"),              // units/cc/lines the price covers
  sourceUrl:   text("source_url").notNull(),
  checkedAt:   text("checked_at").notNull(),  // YYYY-MM-DD
  note:        text("note"),
});

/* ─── Types ───────────────────────────────────────────────────────── */
export type City     = typeof cities.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Clinic   = typeof clinics.$inferSelect;
export type ClinicReview = typeof clinicReviews.$inferSelect;

/* ─── clinic_doctors ──────────────────────────────────────────────── */
// Shown only on Premium profiles (max 3). Created by scripts/migrate-tiers.ts.
export const clinicDoctors = sqliteTable("clinic_doctors", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  clinicId:    integer("clinic_id").notNull().references(() => clinics.id),
  name:        text("name").notNull(),
  role:        text("role"),
  credentials: text("credentials"),
  licence:     text("licence"),
  photoUrl:    text("photo_url"),
  sortOrder:   integer("sort_order").notNull().default(0),
});
export type ClinicDoctor = typeof clinicDoctors.$inferSelect;
