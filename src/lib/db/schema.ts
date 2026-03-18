import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
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
  googleRating:       real("google_rating"),
  googleReviewsCount: integer("google_reviews_count"),

  // Filters
  englishSpeaking: integer("english_speaking", { mode: "boolean" }).default(false),
  nearBts:         integer("near_bts",         { mode: "boolean" }).default(false),
  nearMrt:         integer("near_mrt",         { mode: "boolean" }).default(false),
  openWeekends:    integer("open_weekends",    { mode: "boolean" }).default(false),
  verified:        integer("verified",         { mode: "boolean" }).default(false),
  featured:        integer("featured",         { mode: "boolean" }).default(false),
  featuredPosition: integer("featured_position"),

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

/* ─── Types ───────────────────────────────────────────────────────── */
export type City     = typeof cities.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Clinic   = typeof clinics.$inferSelect;
export type ClinicReview = typeof clinicReviews.$inferSelect;
