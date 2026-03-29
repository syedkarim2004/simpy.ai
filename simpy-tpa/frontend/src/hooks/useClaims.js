import { useState, useEffect } from 'react';
import { getClaims } from '../lib/api';

export function useClaims(filters = {}) {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClaims() {
      try {
        setLoading(true);
        const response = await getClaims(filters);
        setClaims(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClaims();
  }, [JSON.stringify(filters)]);

  return { claims, loading, error, setClaims };
}
