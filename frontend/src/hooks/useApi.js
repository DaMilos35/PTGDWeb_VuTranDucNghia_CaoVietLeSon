// ============================================================
// useApi HOOK — Hand-Me-On
// ============================================================

import { useState, useEffect, useRef } from "react";

/**
 * Generic async data-fetching hook.
 * @param {Function} fn  - Async function to call. Must be stable (defined outside component
 *                         or wrapped in useCallback), otherwise pass a stable `deps` array.
 * @param {Array}   deps - Dependency array that re-triggers the fetch when it changes.
 */
export default function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Keep a ref to avoid stale-closure issues
  const fnRef = useRef(fn);
  useEffect(() => { fnRef.current = fn; });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fnRef.current()
      .then((d) => { if (alive) { setData(d); setLoading(false); } })
      .catch((e) => { if (alive) { setError(e.message); setLoading(false); } });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, setData };
}
