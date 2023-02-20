import { useState, useEffect } from 'react';

export function useFetchJson<T>(path: string): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await window.fetch(path);
        const json: T = await response.json();

        if (response.ok) {
          setData(json);
        } else {
          throw new Error(`Failed to fetch level JSON from path ${path}, ${response.statusText}`);
        }
      } catch (err) {
        console.error(err)
      }
    };
    fetchData();
  }, [path]);

  return data;
}