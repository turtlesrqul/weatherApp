const SEARCH_SAVE_TIMEOUT_MS = 2500;

const saveSearch = async (cityName) => {
  const trimmedCityName = typeof cityName === 'string' ? cityName.trim() : '';

  if (!trimmedCityName) {
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SEARCH_SAVE_TIMEOUT_MS);

  try {
    const response = await fetch('/api/searches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cityName: trimmedCityName }),
      signal: controller.signal,
    });

    return response.ok;
  } catch (error) {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
};

export { saveSearch };
