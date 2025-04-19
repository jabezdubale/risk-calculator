import React from "react";
import "./App.css"; // optional for styling if needed

// then paste your full code here
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

export default function RiskCalculator() {
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

    setResults({ mode, tpPoints, slPoints, tpTicks, tpPips, slTicks, slPips,
      lotSize, profit, riskUsd, riskAmount, margin
    });
  };
  return (
    <div className="max-w-xl mx-auto p-4 bg-white">
      <Tabs defaultValue="risk" className="space-y-4">
        <TabsList>
          <TabsTrigger value="risk">By Risk %</TabsTrigger>
          <TabsTrigger value="lot">By Lot Size</TabsTrigger>
        </TabsList>

        <TabsContent value="risk">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600">Asset Pair</label>
              <select value={assetPair} onChange={e => setAssetPair(e.target.value)} className="border rounded p-2 w-full">
                {ASSET_PAIRS.map(p => <option key={p.symbol} value={p.symbol}>{p.symbol}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Entry Price</label>
              <Input type="number" step={current.pip} value={entry} onChange={e => setEntry(parseFloat(e.target.value))} className={errors.entry ? 'border-red-500' : ''} />
              {errors.entry && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Take Profit (TP)</label>
              <Input type="number" step={current.pip} value={tp} onChange={e => setTP(parseFloat(e.target.value))} className={errors.tp ? 'border-red-500' : ''} />
              {errors.tp && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Stop Loss (SL)</label>
              <Input type="number" step={current.pip} value={sl} onChange={e => setSL(parseFloat(e.target.value))} className={errors.sl ? 'border-red-500' : ''} />
              {errors.sl && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Account Balance (USD)</label>
              <Input type="number" step="0.01" value={balance} onChange={e => setBalance(parseFloat(e.target.value))} className={errors.balance ? 'border-red-500' : ''} />
              {errors.balance && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Risk Percentage (%)</label>
              <Input type="number" step="0.1" value={riskPercent} onChange={e => setRiskPercent(parseFloat(e.target.value))} />
              {errors.riskPercent && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Leverage</label>
              <Input type="number" step="1" value={leverage} onChange={e => setLeverage(parseFloat(e.target.value))} className={errors.leverage ? 'border-red-500' : ''} />
              {errors.leverage && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => calculate('risk')} className="w-full">Calculate Risk</Button>
            <Button onClick={() => setShowResetModal(true)} className="w-full mt-2 bg-gray-100 text-gray-700">Reset Form</Button>
          </div>
        </TabsContent>

        <TabsContent value="lot">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600">Asset Pair</label>
              <select value={assetPair} onChange={e => setAssetPair(e.target.value)} className="border rounded p-2 w-full">
                {ASSET_PAIRS.map(p => <option key={p.symbol} value={p.symbol}>{p.symbol}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600">Entry Price</label>
              <Input type="number" step={current.pip} value={entry} onChange={e => setEntry(parseFloat(e.target.value))} className={errors.entry ? 'border-red-500' : ''} />
              {errors.entry && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Take Profit (TP)</label>
              <Input type="number" step={current.pip} value={tp} onChange={e => setTP(parseFloat(e.target.value))} className={errors.tp ? 'border-red-500' : ''} />
              {errors.tp && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Stop Loss (SL)</label>
              <Input type="number" step={current.pip} value={sl} onChange={e => setSL(parseFloat(e.target.value))} className={errors.sl ? 'border-red-500' : ''} />
              {errors.sl && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Account Balance (USD)</label>
              <Input type="number" step="0.01" value={balance} onChange={e => setBalance(parseFloat(e.target.value))} className={errors.balance ? 'border-red-500' : ''} />
              {errors.balance && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Manual Lot Size</label>
              <Input type="number" step="0.01" value={manualLotSize} onChange={e => setManualLotSize(parseFloat(e.target.value))} className={errors.manualLotSize ? 'border-red-500' : ''} />
              {errors.manualLotSize && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
            <div>
              <label className="text-sm text-gray-600">Leverage</label>
              <Input type="number" step="1" value={leverage} onChange={e => setLeverage(parseFloat(e.target.value))} className={errors.leverage ? 'border-red-500' : ''} />
              {errors.leverage && <p className="text-red-500 text-xs mt-1">Value required</p>}
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={() => calculate('lot')} className="w-full">Calculate Risk</Button>
            <Button onClick={() => setShowResetModal(true)} className="w-full mt-2 bg-gray-100 text-gray-700">Reset Form</Button>
          </div>
        </TabsContent>
      </Tabs>

      {results && (
        <>
          <Card className="bg-blue-50 mt-6">
            <CardContent className="space-y-2 text-sm">
              <div className="pt-2"><strong>Asset Pair:</strong> {assetPair}</div>
              <div><strong>TP:</strong> {results.tpPips.toFixed(1)} pips / {results.tpTicks.toFixed(0)} ticks</div>
              <div><strong>SL:</strong> {results.slPips.toFixed(1)} pips / {results.slTicks.toFixed(0)} ticks</div>
              <div><strong>Risk Amount:</strong> ${results.riskUsd.toFixed(2)} ({((results.riskUsd / balance) * 100).toFixed(2)}%)</div>
              <div><strong>Lot Size Used:</strong> {results.lotSize.toFixed(5)} lots</div>
              <div><strong>Potential Profit:</strong> ${results.profit.toFixed(2)}</div>
              <div><strong>Required Margin:</strong> ${results.margin.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 mt-4">
            <CardContent className="pt-4 text-sm space-y-2">
              <div className="italic text-gray-700">
                Calculations for {assetPair}. Tick size = {current.tick}, pip size = {current.pip}.<br />
                Tick size is the minimum price movement of a trading instrument, and pip size is the standard unit of movement used to measure changes in value.
              </div>
              <div><strong>Entry:</strong> {entry}</div>
              <div><strong>TP Points:</strong> |Entry - TP| = |{entry} - {tp}| = {results.tpPoints.toFixed(2)}</div>
              <div><strong>TP Ticks:</strong> TP Points / Tick = {results.tpPoints.toFixed(2)} / {current.tick} = {results.tpTicks.toFixed(0)}</div>
              <div><strong>TP Pips:</strong> TP Points / Pip Size = {results.tpPoints.toFixed(2)} / {current.pip} = {results.tpPips.toFixed(1)}</div>
              <div><strong>SL Points:</strong> |SL - Entry| = |{sl} - {entry}| = {results.slPoints.toFixed(2)}</div>
              <div><strong>SL Ticks:</strong> SL Points / Tick = {results.slPoints.toFixed(2)} / {current.tick} = {results.slTicks.toFixed(0)}</div>
              <div><strong>SL Pips:</strong> SL Points / Pip Size = {results.slPoints.toFixed(2)} / {current.pip} = {results.slPips.toFixed(1)}</div>
              {results.mode === 'risk' ? (
                <>
                  <div><strong>Risk Amount %:</strong> (Risk % / 100) × Balance = ({riskPercent} / 100) × {balance} = ${results.riskAmount.toFixed(2)}</div>
                  <div><strong>Lot Size:</strong> Risk Amount / (SL Points × Contract Size) = {results.riskAmount.toFixed(2)} / ({results.slPoints.toFixed(2)} × {current.contractSize}) = {results.lotSize.toFixed(5)}</div>
                </>
              ) : (
                <div><strong>Risk Amount:</strong> SL Points × Contract Size × Lot Size = {results.slPoints.toFixed(2)} × {current.contractSize} × {results.lotSize.toFixed(5)} = ${results.riskAmount.toFixed(2)}</div>
              )}
              <div><strong>Notional Value:</strong> Entry × Contract Size × Lot Size = {entry} × {current.contractSize} × {results.lotSize.toFixed(5)} = {(entry * current.contractSize * results.lotSize).toFixed(2)}</div>
              <div><strong>Margin:</strong> Notional / Leverage = {(entry * current.contractSize * results.lotSize).toFixed(2)} / {leverage} = ${results.margin.toFixed(2)}</div>
              <div><strong>Profit:</strong> TP Points × Contract Size × Lot Size = {results.tpPoints.toFixed(2)} × {current.contractSize} × {results.lotSize.toFixed(5)} = ${results.profit.toFixed(2)}</div>
            </CardContent>
          </Card>
        </>
      )}
    {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full text-center">
            <p className="mb-4">Are you sure you want to reset the form?</p>
            <div className="flex justify-between gap-4">
              <Button onClick={() => { resetFormConfirmed(); setShowResetModal(false); }} className="flex-1">Yes, Reset</Button>
              <Button onClick={() => setShowResetModal(false)} className="flex-1 bg-gray-200 text-gray-800">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
