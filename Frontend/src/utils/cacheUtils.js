const SEAT_CACHE_KEY = "seat_cache_data";

/* Save cache */
export const setSeatCache = (data) => {
  sessionStorage.setItem(SEAT_CACHE_KEY, JSON.stringify(data));
};

/* Get cache */
export const getSeatCache = () => {
  try {
    const cache = sessionStorage.getItem(SEAT_CACHE_KEY);
    return cache ? JSON.parse(cache) : null;
  } catch {
    return null;
  }
};

/* Clear cache */
export const clearSeatCache = () => {
  sessionStorage.removeItem(SEAT_CACHE_KEY);
};
