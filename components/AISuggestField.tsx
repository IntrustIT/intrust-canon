"use client";

/**
 * AI suggestion banner field — Pattern B from `reference_ai_use.md`.
 *
 * Wraps a form field's label and AI button. When the user clicks the
 * sparkle, the AI output renders as a SUGGESTION banner above the field.
 * The user's existing field text is never replaced silently — the user
 * must click "Use this" to accept, or "Dismiss" to keep their original.
 *
 * This is the canon-compliant replacement for `<AITextHelper>` (which
 * silently replaces the field on click). Migration target: every existing
 * AITextHelper callsite on description / smartGoal / notes-style fields.
 *
 * Usage:
 *   <AISuggestField
 *     label="Description"
 *     value={description}
 *     onChange={setDescription}
 *     entityTitle={title}
 *     entityType="rock"
 *     fieldName="description"
 *   >
 *     <GrowTextarea value={description} onChange={setDescription} ... />
 *   </AISuggestField>
 */

import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import AIContextInspector from "./AIContextInspector";
import AIButton from "./AIButton";

// Visible divider used by Add. Format mirrors the canonical follow-up
// separator at `RockDetailEditor.tsx` (`sep = "───────────────"` plus a
// `— <Label> —` line). The user can read it as content, then delete the
// divider block when they're ready to commit to the AI version, or merge
// phrases across the divider manually.
const ORIGINAL_SEPARATOR = "\n\n───────────────\n— Original below —\n\n";

interface AISuggestFieldProps {
  /** The label rendered above the field (string, or ReactNode for things like a required-* asterisk). */
  label: ReactNode;
  /** Current field value (so AI can read existing content as input). */
  value: string;
  /** Called only when the user explicitly accepts the suggestion. */
  onChange: (newValue: string) => void;
  /** The title/context of the parent entity (e.g., issue title, rock title). */
  entityTitle: string;
  /** What type of entity this is. */
  entityType: "issue" | "rock" | "todo";
  /** Which field we're helping with. */
  fieldName: string;
  /** Optional teamId for context scoping. */
  teamId?: string;
  /** Optional: tooltip override on the sparkle button. */
  buttonTooltip?: string;
  /** Minimum title length before showing the button. */
  minTitleLength?: number;
  /** The actual field input — typically a GrowTextarea. */
  children: ReactNode;
}

export default function AISuggestField({
  label,
  value,
  onChange,
  entityTitle,
  entityType,
  fieldName,
  teamId,
  buttonTooltip,
  minTitleLength = 3,
  children,
}: AISuggestFieldProps) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string>("");
  const customInstructionsRef = useRef("");
  const disabledSourcesRef = useRef<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ai-context-instructions-description_gen");
      if (saved) customInstructionsRef.current = saved;
    } catch { /* ignore */ }
  }, []);

  const generate = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: entityTitle,
          entityType,
          fieldName,
          teamId,
          existingDescription: value || undefined,
          customInstructions: customInstructionsRef.current || undefined,
          disabledSources: disabledSourcesRef.current.length > 0 ? disabledSourcesRef.current : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.description) setSuggestion(data.description);
      }
    } catch {
      /* ignore — banner just won't appear */
    }
    setLoading(false);
  }, [loading, entityTitle, entityType, fieldName, teamId, value]);

  // Add: put the suggestion ABOVE the user's original, separated by a divider.
  // Preserves user text so it can be referenced or salvaged. Repeat-safe — a
  // second Add only swaps the top portion; the original below stays untouched
  // and the divider never doubles up.
  const add = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      onChange(suggestion);
    } else if (value.includes(ORIGINAL_SEPARATOR)) {
      const [, ...rest] = value.split(ORIGINAL_SEPARATOR);
      onChange([suggestion, rest.join(ORIGINAL_SEPARATOR)].join(ORIGINAL_SEPARATOR));
    } else {
      onChange(suggestion + ORIGINAL_SEPARATOR + value);
    }
    setSuggestion("");
  };

  // Replace: wipe the user's original entirely. Explicit destructive action —
  // labeled clearly so it's never silent.
  const replace = () => {
    onChange(suggestion);
    setSuggestion("");
  };

  const dismiss = () => setSuggestion("");

  const showButton = entityTitle.trim().length >= minTitleLength;

  // Tooltip + AI-context-inspector description map (mirrors AITextHelper).
  const inspectorDescriptionMap: Record<string, Record<string, string>> = {
    todo: {
      notes: "Drafts notes for this to-do based on its title and your team context. Renders as a suggestion above the field — your existing text is never replaced unless you click Use this.",
      description: "Drafts a description for this to-do. Suggestion only — never replaces your text without confirmation.",
    },
    issue: {
      description: "Drafts an issue description with potential impact and recommended next steps. Suggestion only — your text stays put unless you click Use this.",
      notes: "Drafts discussion notes for this issue. Suggestion only.",
    },
    rock: {
      smartGoal: "Drafts a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound). Suggestion only — your text stays unless you click Use this.",
      description: "Drafts a rock description (scope, success criteria, deliverables). Suggestion only — your text stays unless you click Use this.",
      notes: "Drafts planning notes for this rock. Suggestion only.",
    },
  };
  const inspectorDescription = inspectorDescriptionMap[entityType]?.[fieldName]
    || `Drafts AI content for the ${fieldName} field. Suggestion only — your text is never replaced without confirmation.`;

  const tooltipMap: Record<string, Record<string, string>> = {
    todo: { notes: "Suggest notes" },
    issue: { description: "Suggest description" },
    rock: { smartGoal: "Suggest SMART goal", description: "Suggest description", notes: "Suggest notes" },
  };
  const tooltip = buttonTooltip || tooltipMap[entityType]?.[fieldName] || "Suggest content";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold text-gray-500">{label}</label>
        {showButton && (
          <AIContextInspector
            feature="description_gen"
            description={inspectorDescription}
            onCustomInstructions={(v) => { customInstructionsRef.current = v; }}
            onDisabledSourcesChange={(keys) => { disabledSourcesRef.current = keys; }}
          >
            <AIButton tooltip={loading ? "Generating…" : (suggestion ? "Suggest again" : tooltip)} onClick={generate} loading={loading} />
          </AIContextInspector>
        )}
      </div>
      {children}
      {suggestion && (
        <div className="mt-2 border border-orange-200 rounded-lg bg-orange-50/40 p-3">
          <div className="flex items-center justify-between mb-1.5 gap-2">
            <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-wide">AI suggestion</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={add}
                title={value.trim() ? "Add this above your original (your text stays below a divider)" : "Add this to the field"}
                className="text-[11px] font-medium px-2 py-0.5 rounded border bg-[#F58326] text-white border-[#F58326] hover:bg-[#E07320]"
              >
                Add
              </button>
              <button
                type="button"
                onClick={replace}
                title={value.trim() ? "Replace your original with this (your text is removed)" : "Use this as the field value"}
                className="text-[11px] font-medium px-2 py-0.5 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="text-[11px] font-medium px-2 py-0.5 rounded border border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                Dismiss
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{suggestion}</p>
        </div>
      )}
    </div>
  );
}
