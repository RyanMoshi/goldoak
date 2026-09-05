"use client";

import { CornerDownLeft, Mic, Sparkles } from "lucide-react";
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  AICommandSuggestions,
  toOptions,
  type SuggestionOption,
} from "@/components/ai/AICommandSuggestions";
import { AIResponsePanel, type CommandStatus } from "@/components/ai/AIResponsePanel";
import { Kbd } from "@/components/ui/Kbd";
import { commandSuggestions } from "@/data/ai";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useIsMac } from "@/hooks/useIsMac";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { useRecentCommands } from "@/hooks/useRecentCommands";
import { cn } from "@/lib/cn";
import { createCommandHandler } from "@/services/ai/commandHandler";
import type { CommandHandler, CommandResult } from "@/types/ai";

interface AICommandBarProps {
  /** Injectable for tests or for the API-backed handler later. */
  handler?: CommandHandler;
}

type Panel = "closed" | "suggestions" | "response";

const PLACEHOLDER = "Ask or command… “Prepare motor quotes for John Kamau”";

export function AICommandBar({ handler }: AICommandBarProps) {
  const commandHandler = useMemo(() => handler ?? createCommandHandler(), [handler]);
  const { recent, remember, clear } = useRecentCommands();

  const [value, setValue] = useState("");
  const [panel, setPanel] = useState<Panel>("closed");
  const [highlighted, setHighlighted] = useState(0);
  const [status, setStatus] = useState<CommandStatus>("working");
  const [submitted, setSubmitted] = useState("");
  const [result, setResult] = useState<CommandResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const isMac = useIsMac();

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);
  const listboxId = useId();
  const optionId = useCallback((index: number) => `${listboxId}-option-${index}`, [listboxId]);

  const options = useMemo(() => toOptions(recent, commandSuggestions, value), [recent, value]);

  const close = useCallback(() => setPanel("closed"), []);
  useClickOutside(rootRef, close, panel !== "closed");

  useKeyboardShortcut({ key: "k", meta: true }, (event) => {
    event.preventDefault();
    inputRef.current?.focus();
    inputRef.current?.select();
    setHighlighted(0);
    setPanel("suggestions");
  });

  const run = useCallback(
    async (command: string) => {
      const text = command.trim();
      if (!text) return;
      const requestId = ++requestRef.current;
      setSubmitted(text);
      setStatus("working");
      setResult(null);
      setErrorMessage(undefined);
      setPanel("response");
      remember(text);
      setValue("");
      try {
        const answer = await commandHandler.handle(text);
        if (requestRef.current !== requestId) return;
        setResult(answer);
        setStatus("done");
      } catch (error) {
        if (requestRef.current !== requestId) return;
        setErrorMessage(error instanceof Error ? error.message : undefined);
        setStatus("error");
      }
    },
    [commandHandler, remember],
  );

  function choose(option: SuggestionOption) {
    void run(option.text);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (panel !== "closed") setPanel("closed");
      else inputRef.current?.blur();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (panel !== "suggestions") setPanel("suggestions");
      setHighlighted((i) => (options.length ? (i + 1) % options.length : 0));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlighted((i) => (options.length ? (i - 1 + options.length) % options.length : 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (panel === "suggestions" && options[highlighted] && !value.trim()) {
        choose(options[highlighted]);
      } else if (value.trim()) {
        void run(value);
      } else if (options[highlighted]) {
        choose(options[highlighted]);
      }
    }
  }

  const expanded = panel === "suggestions";
  const activeDescendant = expanded && options[highlighted] ? optionId(highlighted) : undefined;

  return (
    <div ref={rootRef} className="relative">
      <form
        role="search"
        aria-label="AI command bar"
        onSubmit={(event) => {
          event.preventDefault();
          void run(value);
        }}
        className={cn(
          "group flex h-11 items-center gap-2 rounded-control border bg-surface pr-1.5 pl-3 transition-[border-color,box-shadow] duration-150",
          panel !== "closed"
            ? "border-forest shadow-[0_0_0_1px_var(--color-forest)]"
            : "border-line hover:border-line-strong",
        )}
      >
        <Sparkles
          className={cn("size-[18px] shrink-0 transition-colors", panel !== "closed" ? "text-gold" : "text-gold/80")}
          aria-hidden="true"
          strokeWidth={1.75}
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-label="Ask or command"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={PLACEHOLDER}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setHighlighted(0);
            setPanel("suggestions");
          }}
          onFocus={() => {
            setHighlighted(0);
            setPanel((p) => (p === "response" ? p : "suggestions"));
          }}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-ink placeholder:text-ink-faint focus:outline-none"
        />
        <button
          type="button"
          aria-label="Voice input"
          title="Voice input arrives with field notes"
          onClick={() => {
            setSubmitted("Voice input");
            setResult({
              intent: "unknown",
              title: "Voice input is not available yet",
              lines: [{ text: "Type the command for now. Dictated field notes arrive in a later step." }],
              actions: [],
              source: "Super Agent",
            });
            setStatus("done");
            setPanel("response");
          }}
          className="hidden size-8 shrink-0 items-center justify-center rounded-control text-ink-faint hover:bg-surface-2 hover:text-ink focus-ring sm:inline-flex"
        >
          <Mic className="size-4" aria-hidden="true" strokeWidth={1.75} />
        </button>
        <span className="hidden shrink-0 items-center gap-0.5 md:flex" aria-hidden="true">
          <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
          <Kbd>K</Kbd>
        </span>
        <button
          type="submit"
          aria-label="Run command"
          disabled={!value.trim()}
          className={cn(
            "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-control px-2.5 text-[12.5px] font-semibold transition-colors focus-ring",
            value.trim()
              ? "bg-forest text-white hover:bg-forest-700"
              : "bg-surface-2 text-ink-faint",
          )}
        >
          <span className="hidden sm:inline">Run</span>
          <CornerDownLeft className="size-3.5" aria-hidden="true" />
        </button>
      </form>

      {panel !== "closed" ? (
        <div
          className="absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-card border border-line bg-surface shadow-float animate-fade-in"
        >
          {panel === "suggestions" ? (
            <AICommandSuggestions
              listboxId={listboxId}
              options={options}
              highlightedIndex={highlighted}
              onHighlight={setHighlighted}
              onChoose={choose}
              onClearRecent={recent.length ? clear : undefined}
              optionId={optionId}
            />
          ) : (
            <AIResponsePanel
              status={status}
              command={submitted}
              result={result}
              errorMessage={errorMessage}
              onClose={close}
              onRetry={() => void run(submitted)}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
