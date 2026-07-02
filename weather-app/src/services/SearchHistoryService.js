const SEARCH_SAVE_TIMEOUT_MS = 2500;
const SEARCH_LOAD_TIMEOUT_MS = 4000;

const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
};

const saveSearch = async (cityName) => {
  const trimmedCityName = typeof cityName === 'string' ? cityName.trim() : '';

  if (!trimmedCityName) {
    return false;
  }

  try {
    const response = await fetchWithTimeout(
      '/api/searches',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cityName: trimmedCityName }),
      },
      SEARCH_SAVE_TIMEOUT_MS
    );

    return response.ok;
  } catch (error) {
    return false;
  }
};

const getRecentSearches = async () => {
  const response = await fetchWithTimeout(
    '/api/searches',
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    },
    SEARCH_LOAD_TIMEOUT_MS
  );

  if (!response.ok) {
    throw new Error(`Search history load failed with status ${response.status}.`);
  }

  const data = await response.json();
  return Array.isArray(data.searches) ? data.searches : [];
};

export { getRecentSearches, saveSearch };
