// Asymmetric editorial spans — one clear feature frame, the rest
// supporting it at different weights. Mobile always stacks to full width.
// Shared by the homepage gallery and the /photography page.
const SPANS = [
  "col-span-12 sm:col-span-7",
  "col-span-12 sm:col-span-5 sm:mt-16",
  "col-span-6 sm:col-span-4",
  "col-span-6 sm:col-span-4 sm:mt-10",
  "col-span-12 sm:col-span-4",
];

// How wide each of the above spans actually renders — kept in step so
// next/image fetches a resolution that matches the real display size
// instead of guessing one flat value for every photo.
const SIZES = [
  "(max-width: 640px) 100vw, 55vw",
  "(max-width: 640px) 100vw, 42vw",
  "(max-width: 640px) 50vw, 33vw",
  "(max-width: 640px) 50vw, 33vw",
  "(max-width: 640px) 100vw, 33vw",
];

/** Grid span + matching `sizes` for the photo at position `i`. Anything past the 5th falls back to a half-width slot. */
export function photoSlot(i: number) {
  return {
    span: SPANS[i] ?? "col-span-6",
    sizes: SIZES[i] ?? "(max-width: 640px) 50vw, 45vw",
  };
}
