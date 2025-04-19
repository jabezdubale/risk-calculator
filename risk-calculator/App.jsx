import React from "react";
import "./App.css"; // optional for styling if needed

// then paste your full code here
import React, { useState, useEffect } from "react";
import "./App.css"; // optional for styling

const ASSET_PAIRS = [
  { symbol: "XAUUSD", contractSize: 100, pip: 0.1, tick: 0.01 },
  { symbol: "EURUSD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "USDJPY", contractSize: 100000, pip: 0.01, tick: 0.001 },
  { symbol: "GBPUSD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "USDCHF", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "AUDUSD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "USDCAD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "NZDUSD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "EURGBP", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "EURJPY", contractSize: 100000, pip: 0.01, tick: 0.001 },
  { symbol: "GBPJPY", contractSize: 100000, pip: 0.01, tick: 0.001 },
  { symbol: "AUDJPY", contractSize: 100000, pip: 0.01, tick: 0.001 },
  { symbol: "AUDCAD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "AUDNZD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "NZDJPY", contractSize: 100000, pip: 0.01, tick: 0.001 },
  { symbol: "CADJPY", contractSize: 100000, pip: 0.01, tick: 0.001 },
  { symbol: "CHFJPY", contractSize: 100000, pip: 0.01, tick: 0.001 },
  { symbol: "EURCAD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "EURNZD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "GBPCHF", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "AUDCHF", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "NZDCHF", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "XAGUSD", contractSize: 5000, pip: 0.001, tick: 0.0001 },
  { symbol: "XPTUSD", contractSize: 50, pip: 0.1, tick: 0.01 },
  { symbol: "XPDUSD", contractSize: 100, pip: 0.1, tick: 0.01 }
];

export default function App() {
  const [assetPair, setAssetPair] = useState(() => localStorage.getItem('assetPair') || "XAUUSD");
  const [entry, setEntry] = useState(() => {
    const stored = localStorage.getItem('entry');
    return stored === null || stored === '' ? '' : parseFloat(stored);
  });
  const [tp, setTP] = useState(() => {
    const stored = localStorage.getItem('tp');
    return stored === null || stored === '' ? '' : parseFloat(stored);
  });
  const [sl, setSL] = useState(() => {
    const stored = localStorage.getItem('sl');
    return stored === null || stored === '' ? '' : parseFloat(stored);
  });
  const [balance, setBalance] = useState(() => {
    const stored = localStorage.getItem('balance');
    return stored === null || stored === '' ? '' : parseFloat(stored);
  });
  const [riskPercent, setRiskPercent] = useState(() => {
    const stored = localStorage.getItem('riskPercent');
    return stored === null || stored === '' ? 3 : parseFloat(stored);
  });
  const [manualLotSize, setManualLotSize] = useState(() => {
    const stored = localStorage.getItem('manualLotSize');
    return stored === null || stored === '' ? 0.01 : parseFloat(stored);
  });
  const [leverage, setLeverage] = useState(() => {
    const stored = localStorage.getItem('leverage');
    return stored === null || stored === '' ? 100 : parseFloat(stored);
  });
  const [results, setResults] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (assetPair) localStorage.setItem('assetPair', assetPair);
    if (entry !== '') localStorage.setItem('entry', entry);
    if (tp !== '') localStorage.setItem('tp', tp);
    if (sl !== '') localStorage.setItem('sl', sl);
    if (balance !== '') localStorage.setItem('balance', balance);
    if (riskPercent !== '') localStorage.setItem('riskPercent', riskPercent);
    if (manualLotSize !== '') localStorage.setItem('manualLotSize', manualLotSize);
    if (leverage !== '') localStorage.setItem('leverage', leverage);
  }, [assetPair, entry, tp, sl, balance, riskPercent, manualLotSize, leverage]);

  const resetFormConfirmed = () => {
    setAssetPair("XAUUSD");
    setEntry("");
    setTP("");
    setSL("");
    setBalance("");
    setRiskPercent(3);
    setLeverage(100);
    setManualLotSize(0.01);
    setResults(null);

    localStorage.removeItem('entry');
    localStorage.removeItem('tp');
    localStorage.removeItem('sl');
    localStorage.removeItem('balance');
    localStorage.setItem('riskPercent', 3);
    localStorage.setItem('leverage', 100);
    localStorage.setItem('manualLotSize', 0.01);
    localStorage.setItem('assetPair', 'XAUUSD');
  };

  const current = ASSET_PAIRS.find(p => p.symbol === assetPair);

  const calculate = (mode) => {
    const newErrors = {};
    if (!entry) newErrors.entry = true;
    if (!tp) newErrors.tp = true;
    if (!sl) newErrors.sl = true;
    if (!balance) newErrors.balance = true;
    if (!leverage) newErrors.leverage = true;
    if (mode === 'lot' && !manualLotSize) newErrors.manualLotSize = true;
    if (mode === 'risk' && !riskPercent) newErrors.riskPercent = true;

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    const { pip, tick, contractSize } = current;
    const tpPoints = Math.abs(entry - tp);
    const slPoints = Math.abs(sl - entry);
    const tpTicks = tpPoints / tick;
    const tpPips = tpPoints / pip;
    const slTicks = slPoints / tick;
    const slPips = slPoints / pip;
    const valuePerPoint = contractSize;
    let lotSize, riskAmount, riskUsd;

    if (mode === 'risk') {
      riskAmount = (riskPercent / 100) * balance;
      const riskPerLot = slPoints * valuePerPoint;
      lotSize = riskAmount / riskPerLot;
      riskUsd = slPoints * valuePerPoint * lotSize;
    } else {
      lotSize = manualLotSize;
      riskUsd = slPoints * valuePerPoint * lotSize;
      riskAmount = riskUsd;
    }

    const notional = entry * contractSize * lotSize;
    const margin = notional / leverage;
    const profit = tpPoints * valuePerPoint * lotSize;

    setResults({
      mode, tpPoints, slPoints, tpTicks, tpPips,
      slTicks, slPips, lotSize, profit,
      riskUsd, riskAmount, margin
    });
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 16 }}>
      <h2>Risk Calculator</h2>

      {/* Add your form UI and calculation result rendering here */}

      {showResetModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
          justifyContent: "center", alignItems: "center"
        }}>
          <div style={{
            backgroundColor: "white", padding: 24,
            borderRadius: 8, maxWidth: 300
          }}>
            <p>Are you sure you want to reset the form?</p>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button onClick={() => { resetFormConfirmed(); setShowResetModal(false); }}>
                Yes, Reset
              </button>
              <button onClick={() => setShowResetModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
