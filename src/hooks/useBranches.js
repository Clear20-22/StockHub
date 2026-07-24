import { useState, useEffect, useCallback } from 'react';
import { branchesAPI } from '../services/api';

/**
 * Custom Data Hook for Warehouse Branches.
 * Encapsulates state management, fetching, and refreshing.
 */
export const useBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await branchesAPI.getAll();
      setBranches(response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch warehouse branches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  return {
    branches,
    loading,
    error,
    refresh: fetchBranches,
    setBranches
  };
};
