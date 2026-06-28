// Curation: per-complex citations quoting what each clinic writes.
// Neutral — always attribute the source and link out; never present as our own,
// never endorse one clinic over another. Fill these with real, permitted quotes
// (short excerpts) + the source name + the canonical URL.

export type Citation = {
  /** clinic / source name shown as attribution */
  source: string;
  /** canonical URL of the original article (opens in a new tab) */
  url: string;
  /** a short, fairly-used excerpt */
  quote: string;
};

export const citationsByComplex: Record<string, Citation[]> = {
  hair: [],
  sweat: [],
  skin: [],
  face: [],
  "body-hair": [],
  self: [],
};
