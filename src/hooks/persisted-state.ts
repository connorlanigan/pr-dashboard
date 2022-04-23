import { useEffect, useState } from 'react';

export function usePersistedState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState(getValue(key, defaultValue));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function getValue<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') {
    return fallback;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
