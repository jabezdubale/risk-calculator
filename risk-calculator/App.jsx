import React, { useState, useEffect } from "react";

const ASSET_PAIRS = [
  { symbol: "XAUUSD", contractSize: 100, pip: 0.1, tick: 0.01 },
  { symbol: "EURUSD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "USDJPY", contractSize: 100000, pip: 0.01, tick: 0.001 },
  { symbol: "GBPUSD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "USDCHF", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "AUDUSD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "USDCAD", contractSize: 100000, pip: 0.0001, tick: 0.00001 },
  { symbol: "NZDUSD", contractSize: 100000, pip: 0.0001, tick: 0.00001 }
];

export default function App() {
  const [selectedTab, setSelectedTab] = useState("risk");
  const [assetPair, setAssetPair] = useState("XAUUSD");
  const [entry, setEntry] = useState("");
  const [tp, setTP] = useState("");
  const [sl, setSL] = useState("");
  const [balance, setBalance] = useState("");
  const [riskPercent, setRiskPercent] = useState(3);
  const [manualLotSize, setManualLotSize] = useState(0.01);
  const [leverage, setLeverage] = useState(100);
  const [results, setResults] = useState(null);

  const calculate = () => {
    const pair = ASSET_PAIRS.find(p => p.symbol === assetPair);
    const tpPoints = Math.abs(entry - tp);
    const slPoints = Math.abs(sl - entry);
    const tpTicks = tpPoints / pair.tick;
    const tpPips = tpPoints / pair.pip;
    const slTicks = slPoints / pair.tick;
    const slPips = slPoints / pair.pip;
    const valuePerPoint = pair.contractSize;

    let lotSize, riskAmount, riskUsd;

    if (selectedTab === "risk") {
      riskAmount = (riskPercent / 100) * balance;
      const riskPerLot = slPoints * valuePerPoint;
      lotSize = riskAmount / riskPerLot;
      riskUsd = slPoints * valuePerPoint * lotSize;
    } else {
      lotSize = manualLotSize;
      riskUsd = slPoints * valuePerPoint * lotSize;
      riskAmount = riskUsd;
    }

    const notional = entry * pair.contractSize * lotSize;
    const margin = notional / leverage;
    const profit = tpPoints * valuePerPoint * lotSize;

    setResults({ assetPair, tpPips, tpTicks, slPips, slTicks, riskUsd, lotSize, profit, margin });
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 20 }}>
      <h2>Risk Calculator</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setSelectedTab("risk")} style={{ backgroundColor: selectedTab === "risk" ? "blue" : "gray", color: "white", padding: 10 }}>By Risk %</button>
        <button onClick={() => setSelectedTab("lot")} style={{ backgroundColor: selectedTab === "lot" ? "blue" : "gray", color: "white", padding: 10 }}>By Lot Size</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <label>Asset Pair<select value={assetPair} onChange={e => setAssetPair(e.target.value)}>{ASSET_PAIRS.map(p => <option key={p.symbol} value={p.symbol}>{p.symbol}</option>)}</select></label>
        <label>Entry Price<input type="number" value={entry} onChange={e => setEntry(parseFloat(e.target.value))} /></label>
        <label>Take Profit<input type="number" value={tp} onChange={e => setTP(parseFloat(e.target.value))} /></label>
        <label>Stop Loss<input type="number" value={sl} onChange={e => setSL(parseFloat(e.target.value))} /></label>
        <label>Account Balance<input type="number" value={balance} onChange={e => setBalance(parseFloat(e.target.value))} /></label>
        {selectedTab === "risk" ? (
          <label>Risk %<input type="number" value={riskPercent} onChange={e => setRiskPercent(parseFloat(e.target.value))} /></label>
        ) : (
          <label>Lot Size<input type="number" value={manualLotSize} onChange={e => setManualLotSize(parseFloat(e.target.value))} /></label>
        )}
        <label>Leverage<input type="number" value={leverage} onChange={e => setLeverage(parseFloat(e.target.value))} /></label>
      </div>

      <button onClick={calculate} style={{ marginTop: 20, padding: 10, width: "100%", backgroundColor: "green", color: "white" }}>Calculate</button>

      {results && (
        <div style={{ backgroundColor: "#f0f4ff", padding: 20, marginTop: 20 }}>
          <p><strong>Asset Pair:</strong> {results.assetPair}</p>
          <p><strong>TP:</strong> {results.tpPips.toFixed(1)} pips / {results.tpTicks.toFixed(0)} ticks</p>
          <p><strong>SL:</strong> {results.slPips.toFixed(1)} pips / {results.slTicks.toFixed(0)} ticks</p>
          <p><strong>Risk Amount:</strong> ${results.riskUsd.toFixed(2)}</p>
          <p><strong>Lot Size:</strong> {results.lotSize.toFixed(5)}</p>
          <p><strong>Potential Profit:</strong> ${results.profit.toFixed(2)}</p>
          <p><strong>Required Margin:</strong> ${results.margin.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}