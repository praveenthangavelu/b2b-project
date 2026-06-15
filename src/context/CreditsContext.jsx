import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { COSTS } from '../costs';

const CreditsContext = createContext(null);

export function CreditsProvider({ children, token, user, onBalanceUpdate }) {
  const [balance, setBalance] = useState(user ? Math.max(0, user.credits) : 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && typeof user.credits === 'number') {
      setBalance(Math.max(0, user.credits));
    }
  }, [user?.credits]);

  const refreshBalance = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/credits`, {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (res.ok) {
        const data = await res.json();
        const newBal = Math.max(0, data.credits);
        setBalance(newBal);
        if (onBalanceUpdate) onBalanceUpdate(newBal);
      }
    } catch (err) {
      console.error('Error refreshing balance:', err);
    }
  };

  useEffect(() => {
    refreshBalance();
  }, [token]);

  const spend = async (action, cost) => {
    const actionCost = typeof cost === 'number' ? cost : COSTS[action];
    if (balance < actionCost) {
      window.dispatchEvent(new Event('prospecto:buy-credits'));
      throw new Error('Out of credits');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/credits/spend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ action, cost: actionCost }),
      });
      if (res.status === 402) {
        await refreshBalance();
        window.dispatchEvent(new Event('prospecto:buy-credits'));
        throw new Error('Out of credits');
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Deduction failed');
      }
      const data = await res.json();
      const newBal = Math.max(0, data.credits);
      setBalance(newBal);
      if (onBalanceUpdate) onBalanceUpdate(newBal);
      return newBal;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = (newBalance) => {
    if (typeof newBalance === 'number') {
      const clamped = Math.max(0, newBalance);
      setBalance(clamped);
      if (onBalanceUpdate) onBalanceUpdate(clamped);
    }
  };

  const canAfford = (action, cost) => {
    const actionCost = typeof cost === 'number' ? cost : COSTS[action];
    return balance >= actionCost;
  };

  return (
    <CreditsContext.Provider value={{ balance, spend, canAfford, updateBalance, loading }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) throw new Error('useCredits must be used within a CreditsProvider');
  return context;
}
