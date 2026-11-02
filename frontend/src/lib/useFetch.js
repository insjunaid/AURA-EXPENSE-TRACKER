import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useUI } from '../context/UIContext';

/**
 * Loads data for a page and reloads whenever `deps` change or any
 * transaction is added/edited/deleted anywhere in the app (dataVersion).
 * Keeps the previous data on screen while refetching — no flashing.
 */
export function useFetch(fetcher, deps = [], { errorText = 'Could not load data' } = {}) {
  const { dataVersion } = useUI();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcherRef.current()
      .then((d) => { if (!cancelled) setData(d); })
      .catch(() => { if (!cancelled) toast.error(errorText, { id: errorText }); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [...deps, dataVersion]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, initialLoading: loading && data === null };
}
