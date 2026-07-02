// App.js
import React, { useCallback, useState, useEffect } from 'react';
import WeatherCard from './components/WeatherCard';
import Calendar from './components/Calendar';
import MeteorologicalPredictions from './components/MeteorologicalPredictions';
import RecentSearches from './components/RecentSearches';
import { getRecentSearches, saveSearch } from './services/SearchHistoryService';
import { getWeatherData } from './services/WeatherService';

const App = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [date, setDate] = useState('');
  const [meteorologicalPredictions, setMeteorologicalPredictions] = useState(
    'Search for a city to see the weekly forecast.'
  );
  const [recentSearches, setRecentSearches] = useState([]);
  const [isRecentSearchesLoading, setIsRecentSearchesLoading] = useState(false);
  const [isRecentSearchesUnavailable, setIsRecentSearchesUnavailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadRecentSearches = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setIsRecentSearchesLoading(true);
    }

    try {
      const searches = await getRecentSearches();
      setRecentSearches(searches);
      setIsRecentSearchesUnavailable(false);
    } catch (error) {
      setRecentSearches([]);
      setIsRecentSearchesUnavailable(true);
    } finally {
      if (showLoading) {
        setIsRecentSearchesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const currentDate = new Date().toDateString();

    setDate(currentDate);
    void loadRecentSearches();
  }, [loadRecentSearches]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const data = await getWeatherData(city);
      setWeatherData(data);
      setMeteorologicalPredictions(data.forecastSummary);
      void saveSearch(data.name).then((saved) => {
        if (saved) {
          void loadRecentSearches({ showLoading: false });
        }
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(null);
      setMeteorologicalPredictions('Search for a city to see the weekly forecast.');
      setErrorMessage(error.message || 'Unable to fetch weather data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {weatherData && <WeatherCard data={weatherData} />}
      {date && <Calendar date={date} />}
      {meteorologicalPredictions && (
        <MeteorologicalPredictions predictions={meteorologicalPredictions} />
      )}
      <RecentSearches
        searches={recentSearches}
        isLoading={isRecentSearchesLoading}
        isUnavailable={isRecentSearchesUnavailable}
      />
    </div>
  );
};

export default App;
