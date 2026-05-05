"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ContextSource {
  key: string;
  label: string;
  enabled: boolean;
  scope: string;
  included: boolean;
  ruleId?: string;
}

interface InspectorData {
  feature: string;
  featureSet: string[];
  sources: ContextSource[];
  userTeams: { id: string; name: string }[];
  availableFeatures: string[];
}

interface AIContextInspectorProps {
  /** The AI feature name for context lookup (e.g., "description_gen", "general") */
  feature: string;
  /** Human-readable description of what this AI button does and where results go */
  description?: string;
  /** Optional custom instructions key for localStorage persistence */
  storageKey?: string;
  /** Callback when custom instructions change — pass to your AI call */
  onCustomInstructions?: (instructions: string) => void;
  /** Callback when source toggles change — receives list of disabled source keys */
  onDisabledSourcesChange?: (disabledKeys: string[]) => void;
  /** When true, left-click on the wrapped child also opens the inspector.
   *  Default false (right-click only) — used when the wrapped child has its
   *  own onClick that should keep firing. Use true when the wrapped child is
   *  purely a "show context" affordance like an info icon. */
  openOnClick?: boolean;
  /** Wrapped child element (the AI button) */
  children: ReactNode;
}

/**
 * Wrap any AI-powered button to add a right-click context inspector.
 * Right-click shows what context sources the AI uses and lets users
 * toggle individual sources on/off and write custom instructions.
 *
 * Usage:
 *   <AIContextInspector feature="description_gen">
 *     <button onClick={generate}>AI Assist</button>
 *   </AIContextInspector>
 */
export default function AIContextInspector({
  feature,
  description,
  storageKey,
  onCustomInstructions,
  onDisabledSourcesChange,
  openOnClick = false,
  children,
}: AIContextInspectorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InspectorData | null>(null);
  const [customInstructions, setCustomInstructions] = useState("");
  const [saved, setSaved] = useState(false);
  const [disabledSources, setDisabledSources] = useState<Record<string, boolean>>({});
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Persistence keys
  const persistKey = storageKey || `ai-context-instructions-${feature}`;
  const sourcesPersistKey = `ai-disabled-sources-${feature}`;

  // Load saved instructions and source toggles on mount
  useEffect(() => {
    try {
      const savedInstr = localStorage.getItem(persistKey);
      if (savedInstr) {
        setCustomInstructions(savedInstr);
        onCustomInstructions?.(savedInstr);
      }
    } catch { /* ignore */ }
    try {
      const savedSources = localStorage.getItem(sourcesPersistKey);
      if (savedSources) {
        const parsed = JSON.parse(savedSources);
        setDisabledSources(parsed);
        const keys = Object.keys(parsed).filter(k => parsed[k]);
        if (keys.length > 0) onDisabledSourcesChange?.(keys);
      }
    } catch { /* ignore */ }
  }, [persistKey, sourcesPersistKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
          wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function loadInspector() {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/context-inspector?feature=${feature}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }

  const [panelPos, setPanelPos] = useState<{ top: number; left: number; openBelow: boolean; maxH: number }>({ top: 0, left: 0, openBelow: false, maxH: 500 });

  // Compute a fully-clamped panel position from the trigger rect. Keeps the
  // panel inside the viewport on all 4 edges with an 8px safe zone. Preferred
  // alignment: right edge of panel = right edge of trigger, opening below.
  function computePanelPos(rect: DOMRect) {
    const PANEL_W = 320;
    const SAFE = 8;
    const GAP = 4;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: align right edges, then clamp.
    let left = rect.right - PANEL_W;
    if (left + PANEL_W > vw - SAFE) left = vw - PANEL_W - SAFE;
    if (left < SAFE) left = SAFE;

    // Vertical: prefer below; fall back to above when there's more room there.
    const spaceBelow = vh - rect.bottom - GAP - SAFE;
    const spaceAbove = rect.top - GAP - SAFE;
    const openBelow = spaceBelow >= Math.min(500, 0.7 * vh) || spaceBelow >= spaceAbove;
    const maxH = Math.max(200, Math.min(0.7 * vh, openBelow ? spaceBelow : spaceAbove));
    const top = openBelow ? rect.bottom + GAP : rect.top - GAP;
    return { top, left, openBelow, maxH };
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) setPanelPos(computePanelPos(rect));
    setOpen(true);
    if (!data) loadInspector();
  }

  // Re-clamp on viewport resize while the panel is open.
  useEffect(() => {
    if (!open) return;
    function onResize() {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (rect) setPanelPos(computePanelPos(rect));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  function saveInstructions() {
    try {
      localStorage.setItem(persistKey, customInstructions);
      onCustomInstructions?.(customInstructions);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch { /* ignore */ }
  }

  function clearInstructions() {
    setCustomInstructions("");
    try { localStorage.removeItem(persistKey); } catch { /* ignore */ }
    onCustomInstructions?.("");
  }

  function toggleSource(key: string) {
    const updated = { ...disabledSources, [key]: !disabledSources[key] };
    // Clean up false entries
    if (!updated[key]) delete updated[key];
    setDisabledSources(updated);
    try { localStorage.setItem(sourcesPersistKey, JSON.stringify(updated)); } catch { /* ignore */ }
    const disabledKeys = Object.keys(updated).filter(k => updated[k]);
    onDisabledSourcesChange?.(disabledKeys);
  }

  function isSourceEnabled(key: string): boolean {
    return !disabledSources[key];
  }

  // Categorize sources
  const manualSources = data?.sources.filter(s => s.key.startsWith("manual_")) || [];
  const autoSources = data?.sources.filter(s => !s.key.startsWith("manual_") && !s.key.startsWith("rule_")) || [];
  const ruleSources = data?.sources.filter(s => s.key.startsWith("rule_")) || [];

  return (
    <div className="relative inline-flex" ref={wrapperRef}>
      <div
        onContextMenu={handleContextMenu}
        onClick={openOnClick ? handleContextMenu : undefined}
        className="inline-flex"
      >
        {children}
      </div>

      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[9999] w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col"
          style={{
            maxHeight: panelPos.maxH,
            top: panelPos.openBelow ? panelPos.top : undefined,
            bottom: panelPos.openBelow ? undefined : Math.max(8, window.innerHeight - panelPos.top),
            left: panelPos.left,
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex-none">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#0069AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-900">AI Context Inspector</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {description && (
              <p className="text-[11px] text-gray-600 mt-1.5 leading-relaxed">{description}</p>
            )}
            <p className="text-[10px] text-gray-400 mt-1">
              Feature: <span className="font-mono text-gray-500">{feature}</span>
            </p>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            {loading ? (
              <div className="py-6 text-center text-gray-400 text-sm">Loading context sources...</div>
            ) : data ? (
              <div className="p-3 space-y-3">
                {/* Company Context */}
                {manualSources.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Company Context</p>
                    <div className="space-y-1">
                      {manualSources.map((s) => (
                        <SourceRow key={s.key} source={s} enabled={isSourceEnabled(s.key)} onToggle={() => toggleSource(s.key)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Auto Data Sources */}
                {autoSources.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Data Sources</p>
                    <div className="space-y-1">
                      {autoSources.map((s) => (
                        <SourceRow key={s.key} source={s} enabled={isSourceEnabled(s.key)} onToggle={() => toggleSource(s.key)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Rules */}
                {ruleSources.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">AI Rules</p>
                    <div className="space-y-1">
                      {ruleSources.map((s) => (
                        <SourceRow key={s.key} source={s} enabled={isSourceEnabled(s.key)} onToggle={() => toggleSource(s.key)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Instructions */}
                <div className="border-t border-gray-100 pt-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Custom Instructions</p>
                  <p className="text-[10px] text-gray-400 mb-2">
                    Write natural language to override or augment AI behavior for this feature.
                  </p>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder='e.g. "use bullet points", "keep it under 100 words", "focus on technical details"'
                    rows={3}
                    className="w-full text-xs border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#0069AA]/20 focus:border-[#0069AA] resize-none"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={saveInstructions}
                      className="px-3 py-1 text-[11px] font-medium text-white rounded-md"
                      style={{ backgroundColor: "#0069AA" }}
                    >
                      Save
                    </button>
                    {customInstructions && (
                      <button
                        onClick={clearInstructions}
                        className="px-3 py-1 text-[11px] font-medium text-gray-500 hover:text-red-500"
                      >
                        Clear
                      </button>
                    )}
                    {saved && (
                      <span className="text-[11px] text-green-600">Saved</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-gray-400 text-sm">Failed to load context</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function SourceRow({ source, enabled, onToggle }: { source: ContextSource; enabled: boolean; onToggle: () => void }) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md ${enabled ? "bg-gray-50" : "bg-gray-50/50"}`}>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors flex-shrink-0 ${
          enabled ? "bg-[#0069AA]" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className={`text-[11px] truncate flex-1 ${enabled ? "text-gray-700" : "text-gray-400 line-through"}`}>{source.label}</span>
      {source.scope !== "everyone" && (
        <span className="text-[9px] text-gray-400 flex-shrink-0">{source.scope}</span>
      )}
    </div>
  );
}
