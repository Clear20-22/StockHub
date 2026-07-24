import { useState, useEffect, useCallback } from 'react';
import { goodsAPI } from '../services/api';

/**
 * Custom Data Hook for Goods/Inventory.
 * Encapsulates state management, fetching, and refreshing.
 */
export const useGoods = (filters = {}) => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoods = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await goodsAPI.getAll(filters);
      setGoods(response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch goods inventory');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchGoods();
  }, [fetchGoods]);

  return {
    goods,
    loading,
    error,
    refresh: fetchGoods,
    setGoods
  };
};
