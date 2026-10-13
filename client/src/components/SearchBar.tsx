import React, { useEffect, useState } from 'react';
import type { LocationData } from '../types/weather';

interface ApiErrorResponse {
  error?: { message?: string } | string;
}

function getApiErrorMessage(body: unknown): string {
  if (typeof body !== 'object' || body === null || !('error' in body)) {
    return 'Search error';
  }

  const error = (body as ApiErrorResponse).error;
  if (typeof error === 'string') return error;
  if (error?.message?.toLowerCase().includes('not found')) return 'No cities found.';
  return error?.message || 'Search error';
}

interface SearchBarProps {
  onLocationSelect: (location: LocationData) => void | Promise<void>;
}

function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');
        const response = await fetch(`/api/location?q=${encodeURIComponent(query.trim())}`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          let body: unknown;
          try {
            body = await response.json();
          } catch {
            body = null;
          }
          throw new Error(getApiErrorMessage(body));
        }

        const data = (await response.json()) as LocationData[];
        setResults(data);
        setActiveIndex(-1);
      } catch (requestError) {
        if (requestError instanceof Error && requestError.name === 'AbortError') return;
        setResults(null);
        setErrorMsg(requestError instanceof Error ? requestError.message : 'Search error');
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [query]);

  const executeSelection = (index: number) => {
    if (!results || index < 0 || index >= results.length) return;
    void onLocationSelect(results[index]);
    setQuery('');
    setResults(null);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setResults(null);
      setActiveIndex(-1);
      return;
    }
    if (!results?.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + results.length) % results.length);
    } else if (event.key === 'Enter' && activeIndex >= 0) {
      event.preventDefault();
      executeSelection(activeIndex);
    }
  };

  return (
    <section className="search-section" aria-label="Search for a city">
      <label htmlFor="city-search">Search for a city</label>
      <input
        id="city-search"
        type="search"
        placeholder="Enter city name"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (!event.target.value.trim()) {
            setResults(null);
            setErrorMsg('');
          }
        }}
        onKeyDown={handleKeyDown}
        aria-controls="city-results"
        aria-autocomplete="list"
      />

      {isLoading && <p className="search-status">Loading...</p>}
      {errorMsg && <p className="search-status search-status--error">{errorMsg}</p>}
      {results && results.length === 0 && !isLoading && <p className="search-status">No results found</p>}

      {results && results.length > 0 && (
        <ul id="city-results" className="search-results">
          {results.map((location, index) => (
            <li key={`${location.lat}-${location.lon}`}>
              <button
                className={index === activeIndex ? 'search-result search-result--active' : 'search-result'}
                type="button"
                onClick={() => executeSelection(index)}
              >
                <strong>{location.name}</strong>
                <span>{location.state ? `${location.state}, ` : ''}{location.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SearchBar;
