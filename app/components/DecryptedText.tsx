"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";

interface DecryptedTextProps extends ComponentProps<"span"> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  revealUnit?: "character" | "word";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  encryptedClassName?: string;
  parentClassName?: string;
  animateOn?: "view" | "hover" | "inViewHover" | "click";
  clickMode?: "once" | "toggle";
}

type Direction = "forward" | "reverse";
type WordRange = { start: number; end: number };

function getWordRanges(text: string): WordRange[] {
  const ranges: WordRange[] = [];
  const re = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }
  return ranges;
}

function isRangeRevealed(
  revealed: Set<number>,
  start: number,
  end: number,
  source: string,
): boolean {
  for (let i = start; i < end; i++) {
    if (source[i] !== " " && !revealed.has(i)) return false;
  }
  return true;
}

function fillRange(set: Set<number>, start: number, end: number): void {
  for (let i = start; i < end; i++) set.add(i);
}

export function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  revealUnit = "character",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  clickMode = "once",
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(
    new Set(),
  );
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const [isDecrypted, setIsDecrypted] = useState<boolean>(
    animateOn !== "click" && animateOn !== "view" && animateOn !== "inViewHover",
  );
  const [direction, setDirection] = useState<Direction>("forward");

  const containerRef = useRef<HTMLSpanElement>(null);
  const orderRef = useRef<number[]>([]);
  const pointerRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentWordRef = useRef<number>(0);

  const wordRanges = useMemo(() => getWordRanges(text), [text]);
  const isWordReveal = revealUnit === "word";

  const availableChars = useMemo<string[]>(() => {
    return useOriginalCharsOnly
      ? Array.from(new Set(text.split(""))).filter((char) => char !== " ")
      : characters.split("");
  }, [useOriginalCharsOnly, text, characters]);

  const shuffleText = useCallback(
    (
      originalText: string,
      currentRevealed: Set<number>,
      visibleUntil?: number,
    ) => {
      const cutoff = visibleUntil ?? originalText.length;
      return originalText
        .slice(0, cutoff)
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (currentRevealed.has(i)) return originalText[i];
          return availableChars[
            Math.floor(Math.random() * availableChars.length)
          ];
        })
        .join("");
    },
    [availableChars],
  );

  const visibleUntilForWord = useCallback(
    (wordIndex: number): number => {
      if (!isWordReveal) return text.length;
      if (wordIndex < 0 || wordRanges.length === 0) return 0;
      if (wordIndex >= wordRanges.length) return text.length;
      return wordRanges[wordIndex].end;
    },
    [isWordReveal, text.length, wordRanges],
  );

  const computeOrder = useCallback(
    (len: number): number[] => {
      const order: number[] = [];
      if (len <= 0) return order;
      if (revealDirection === "start") {
        for (let i = 0; i < len; i++) order.push(i);
        return order;
      }
      if (revealDirection === "end") {
        for (let i = len - 1; i >= 0; i--) order.push(i);
        return order;
      }
      const middle = Math.floor(len / 2);
      let offset = 0;
      while (order.length < len) {
        if (offset % 2 === 0) {
          const idx = middle + offset / 2;
          if (idx >= 0 && idx < len) order.push(idx);
        } else {
          const idx = middle - Math.ceil(offset / 2);
          if (idx >= 0 && idx < len) order.push(idx);
        }
        offset++;
      }
      return order.slice(0, len);
    },
    [revealDirection],
  );

  const fillAllIndices = useCallback((): Set<number> => {
    const s = new Set<number>();
    for (let i = 0; i < text.length; i++) s.add(i);
    return s;
  }, [text]);

  const removeRandomIndices = useCallback(
    (set: Set<number>, count: number): Set<number> => {
      const arr = Array.from(set);
      for (let i = 0; i < count && arr.length > 0; i++) {
        const idx = Math.floor(Math.random() * arr.length);
        arr.splice(idx, 1);
      }
      return new Set(arr);
    },
    [],
  );

  const encryptInstantly = useCallback(() => {
    const emptySet = new Set<number>();
    currentWordRef.current = 0;
    setRevealedIndices(emptySet);
    setDisplayText(
      shuffleText(
        text,
        emptySet,
        isWordReveal ? visibleUntilForWord(0) : undefined,
      ),
    );
    setIsDecrypted(false);
  }, [text, shuffleText, isWordReveal, visibleUntilForWord]);

  const triggerDecrypt = useCallback(() => {
    currentWordRef.current = 0;
    if (sequential) {
      orderRef.current = computeOrder(text.length);
      pointerRef.current = 0;
      setRevealedIndices(new Set());
    } else {
      setRevealedIndices(new Set());
    }
    setDirection("forward");
    setIsAnimating(true);
  }, [sequential, computeOrder, text.length]);

  const triggerReverse = useCallback(() => {
    currentWordRef.current = Math.max(0, wordRanges.length - 1);
    const allRevealed = fillAllIndices();
    if (sequential) {
      orderRef.current = computeOrder(text.length).slice().reverse();
      pointerRef.current = 0;
      setRevealedIndices(allRevealed);
      setDisplayText(shuffleText(text, allRevealed));
    } else {
      setRevealedIndices(allRevealed);
      setDisplayText(shuffleText(text, allRevealed));
    }
    setDirection("reverse");
    setIsAnimating(true);
  }, [
    sequential,
    computeOrder,
    fillAllIndices,
    shuffleText,
    text,
    wordRanges.length,
  ]);

  useEffect(() => {
    if (!isAnimating) return;

    let currentIteration = 0;

    const getNextIndex = (revealedSet: Set<number>): number => {
      const textLength = text.length;
      switch (revealDirection) {
        case "start":
          return revealedSet.size;
        case "end":
          return textLength - 1 - revealedSet.size;
        case "center": {
          const middle = Math.floor(textLength / 2);
          const offset = Math.floor(revealedSet.size / 2);
          const nextIndex =
            revealedSet.size % 2 === 0
              ? middle + offset
              : middle - offset - 1;

          if (
            nextIndex >= 0 &&
            nextIndex < textLength &&
            !revealedSet.has(nextIndex)
          ) {
            return nextIndex;
          }
          for (let i = 0; i < textLength; i++) {
            if (!revealedSet.has(i)) return i;
          }
          return 0;
        }
        default:
          return revealedSet.size;
      }
    };

    const getNextIndexInRange = (
      revealedSet: Set<number>,
      start: number,
      end: number,
      mode: "add" | "remove",
    ): number => {
      const candidates: number[] = [];
      for (let i = start; i < end; i++) {
        const isRevealed = revealedSet.has(i);
        if (mode === "add" ? !isRevealed : isRevealed) {
          candidates.push(i);
        }
      }
      if (candidates.length === 0) return -1;

      switch (revealDirection) {
        case "end":
          return mode === "add"
            ? candidates[candidates.length - 1]
            : candidates[0];
        case "center": {
          const middle = start + Math.floor((end - start) / 2);
          let best = candidates[0];
          let bestDist = Math.abs(best - middle);
          for (const idx of candidates) {
            const dist = Math.abs(idx - middle);
            if (dist < bestDist) {
              best = idx;
              bestDist = dist;
            }
          }
          return best;
        }
        default:
          return mode === "add"
            ? candidates[0]
            : candidates[candidates.length - 1];
      }
    };

    const finishForward = (revealed: Set<number>) => {
      clearInterval(intervalRef.current ?? undefined);
      setIsAnimating(false);
      setIsDecrypted(true);
      setDisplayText(text);
      return revealed;
    };

    const finishReverse = (revealed: Set<number>) => {
      clearInterval(intervalRef.current ?? undefined);
      setIsAnimating(false);
      setIsDecrypted(false);
      return revealed;
    };

    intervalRef.current = setInterval(() => {
      setRevealedIndices((prevRevealed) => {
        if (isWordReveal) {
          if (wordRanges.length === 0) {
            return direction === "forward"
              ? finishForward(prevRevealed)
              : finishReverse(prevRevealed);
          }

          if (sequential) {
            if (direction === "forward") {
              if (currentWordRef.current >= wordRanges.length) {
                return finishForward(prevRevealed);
              }

              const word = wordRanges[currentWordRef.current];
              const nextIndex = getNextIndexInRange(
                prevRevealed,
                word.start,
                word.end,
                "add",
              );
              const newRevealed = new Set(prevRevealed);
              if (nextIndex !== -1) newRevealed.add(nextIndex);

              if (isRangeRevealed(newRevealed, word.start, word.end, text)) {
                currentWordRef.current += 1;
              }

              if (currentWordRef.current >= wordRanges.length) {
                return finishForward(newRevealed);
              }

              setDisplayText(
                shuffleText(
                  text,
                  newRevealed,
                  visibleUntilForWord(currentWordRef.current),
                ),
              );
              return newRevealed;
            }

            if (direction === "reverse") {
              if (currentWordRef.current < 0) {
                setDisplayText(shuffleText(text, new Set(), 0));
                return finishReverse(new Set());
              }

              const word = wordRanges[currentWordRef.current];
              const idxToRemove = getNextIndexInRange(
                prevRevealed,
                word.start,
                word.end,
                "remove",
              );
              const newRevealed = new Set(prevRevealed);
              if (idxToRemove !== -1) newRevealed.delete(idxToRemove);

              let wordHasRevealed = false;
              for (let i = word.start; i < word.end; i++) {
                if (newRevealed.has(i)) {
                  wordHasRevealed = true;
                  break;
                }
              }

              if (!wordHasRevealed) {
                currentWordRef.current -= 1;
              }

              if (currentWordRef.current < 0) {
                setDisplayText(shuffleText(text, new Set(), 0));
                return finishReverse(new Set());
              }

              setDisplayText(
                shuffleText(
                  text,
                  newRevealed,
                  visibleUntilForWord(currentWordRef.current),
                ),
              );
              return newRevealed;
            }
          } else {
            if (direction === "forward") {
              if (currentWordRef.current >= wordRanges.length) {
                return finishForward(prevRevealed);
              }

              setDisplayText(
                shuffleText(
                  text,
                  prevRevealed,
                  visibleUntilForWord(currentWordRef.current),
                ),
              );
              currentIteration++;
              if (currentIteration >= maxIterations) {
                const word = wordRanges[currentWordRef.current];
                const newRevealed = new Set(prevRevealed);
                fillRange(newRevealed, word.start, word.end);
                currentWordRef.current += 1;
                currentIteration = 0;

                if (currentWordRef.current >= wordRanges.length) {
                  return finishForward(newRevealed);
                }

                setDisplayText(
                  shuffleText(
                    text,
                    newRevealed,
                    visibleUntilForWord(currentWordRef.current),
                  ),
                );
                return newRevealed;
              }
              return prevRevealed;
            }

            if (direction === "reverse") {
              if (currentWordRef.current < 0) {
                setDisplayText(shuffleText(text, new Set(), 0));
                return finishReverse(new Set());
              }

              const word = wordRanges[currentWordRef.current];
              let currentSet = prevRevealed;
              if (currentSet.size === 0) {
                currentSet = fillAllIndices();
              }
              const wordSize = Math.max(1, word.end - word.start);
              const removeCount = Math.max(
                1,
                Math.ceil(wordSize / Math.max(1, maxIterations)),
              );
              const nextSet = new Set(currentSet);
              const wordIndices = [...currentSet].filter(
                (i) => i >= word.start && i < word.end,
              );
              for (let i = 0; i < removeCount && wordIndices.length > 0; i++) {
                const idx = Math.floor(Math.random() * wordIndices.length);
                nextSet.delete(wordIndices[idx]);
                wordIndices.splice(idx, 1);
              }

              currentIteration++;
              let wordEmpty = true;
              for (let i = word.start; i < word.end; i++) {
                if (nextSet.has(i)) {
                  wordEmpty = false;
                  break;
                }
              }
              if (wordEmpty || currentIteration >= maxIterations) {
                for (let i = word.start; i < word.end; i++) nextSet.delete(i);
                currentWordRef.current -= 1;
                currentIteration = 0;

                if (currentWordRef.current < 0) {
                  setDisplayText(shuffleText(text, new Set(), 0));
                  return finishReverse(new Set());
                }
              }

              setDisplayText(
                shuffleText(
                  text,
                  nextSet,
                  visibleUntilForWord(currentWordRef.current),
                ),
              );
              return nextSet;
            }
          }
        }

        if (sequential) {
          if (direction === "forward") {
            if (prevRevealed.size < text.length) {
              const nextIndex = getNextIndex(prevRevealed);
              const newRevealed = new Set(prevRevealed);
              newRevealed.add(nextIndex);
              setDisplayText(shuffleText(text, newRevealed));
              return newRevealed;
            }
            clearInterval(intervalRef.current ?? undefined);
            setIsAnimating(false);
            setIsDecrypted(true);
            return prevRevealed;
          }
          if (direction === "reverse") {
            if (pointerRef.current < orderRef.current.length) {
              const idxToRemove = orderRef.current[pointerRef.current++];
              const newRevealed = new Set(prevRevealed);
              newRevealed.delete(idxToRemove);
              setDisplayText(shuffleText(text, newRevealed));
              if (newRevealed.size === 0) {
                clearInterval(intervalRef.current ?? undefined);
                setIsAnimating(false);
                setIsDecrypted(false);
              }
              return newRevealed;
            }
            clearInterval(intervalRef.current ?? undefined);
            setIsAnimating(false);
            setIsDecrypted(false);
            return prevRevealed;
          }
        } else {
          if (direction === "forward") {
            setDisplayText(shuffleText(text, prevRevealed));
            currentIteration++;
            if (currentIteration >= maxIterations) {
              clearInterval(intervalRef.current ?? undefined);
              setIsAnimating(false);
              setDisplayText(text);
              setIsDecrypted(true);
            }
            return prevRevealed;
          }

          if (direction === "reverse") {
            let currentSet = prevRevealed;
            if (currentSet.size === 0) {
              currentSet = fillAllIndices();
            }
            const removeCount = Math.max(
              1,
              Math.ceil(text.length / Math.max(1, maxIterations)),
            );
            const nextSet = removeRandomIndices(currentSet, removeCount);
            setDisplayText(shuffleText(text, nextSet));
            currentIteration++;
            if (nextSet.size === 0 || currentIteration >= maxIterations) {
              clearInterval(intervalRef.current ?? undefined);
              setIsAnimating(false);
              setIsDecrypted(false);
              setDisplayText(shuffleText(text, new Set()));
              return new Set();
            }
            return nextSet;
          }
        }
        return prevRevealed;
      });
    }, speed);
    return () => clearInterval(intervalRef.current ?? undefined);
  }, [
    isAnimating,
    text,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    isWordReveal,
    wordRanges,
    visibleUntilForWord,
    shuffleText,
    direction,
    fillAllIndices,
    removeRandomIndices,
    characters,
    useOriginalCharsOnly,
  ]);

  const handleClick = () => {
    if (animateOn !== "click") return;

    if (clickMode === "once") {
      if (isDecrypted) return;
      setDirection("forward");
      triggerDecrypt();
    }

    if (clickMode === "toggle") {
      if (isDecrypted) {
        triggerReverse();
      } else {
        setDirection("forward");
        triggerDecrypt();
      }
    }
  };

  const triggerHoverDecrypt = useCallback(() => {
    if (isAnimating) return;

    currentWordRef.current = 0;
    setRevealedIndices(new Set());
    setIsDecrypted(false);
    setDisplayText(
      isWordReveal
        ? shuffleText(text, new Set(), visibleUntilForWord(0))
        : text,
    );
    setDirection("forward");
    setIsAnimating(true);
  }, [isAnimating, text, isWordReveal, shuffleText, visibleUntilForWord]);

  const resetToPlainText = useCallback(() => {
    clearInterval(intervalRef.current ?? undefined);
    setIsAnimating(false);
    setRevealedIndices(new Set());
    setDisplayText(text);
    setIsDecrypted(true);
    setDirection("forward");
  }, [text]);

  useEffect(() => {
    if (animateOn !== "view" && animateOn !== "inViewHover") return;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          triggerDecrypt();
          setHasAnimated(true);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [animateOn, hasAnimated, triggerDecrypt]);

  useEffect(() => {
    currentWordRef.current = 0;
    if (
      animateOn === "click" ||
      animateOn === "view" ||
      animateOn === "inViewHover"
    ) {
      encryptInstantly();
    } else {
      setDisplayText(text);
      setIsDecrypted(true);
    }
    setRevealedIndices(new Set());
    setDirection("forward");
  }, [animateOn, text, encryptInstantly]);

  const animateProps =
    animateOn === "hover" || animateOn === "inViewHover"
      ? {
          onMouseEnter: triggerHoverDecrypt,
          onMouseLeave: resetToPlainText,
        }
      : animateOn === "click"
        ? {
            onClick: handleClick,
          }
        : {};

  return (
    <span
      ref={containerRef}
      className={`inline-block whitespace-pre-wrap ${parentClassName}`}
      {...animateProps}
      {...props}
    >
      <span className="sr-only">{text}</span>

      <span aria-hidden="true">
        {displayText.split("").map((char, index) => {
          const isRevealedOrDone =
            revealedIndices.has(index) || (!isAnimating && isDecrypted);

          return (
            <span
              key={index}
              className={isRevealedOrDone ? className : encryptedClassName}
            >
              {char}
            </span>
          );
        })}
      </span>
    </span>
  );
}
