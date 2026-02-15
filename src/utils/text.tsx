import React, { type ReactElement, type ReactNode } from 'react';

export function highlightText(text: string | undefined, query: string, indices?: readonly [number, number][]): ReactElement {
  if (!text) return <></>;
  if (!indices && !query) return <>{text}</>;
  
  if (indices && indices.length > 0) {
    const result: ReactNode[] = [];
    let lastIndex = 0;

    // Sort indices by start position to be safe
    const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);

    sortedIndices.forEach(([start, end], i) => {
      // Add text before match
      if (start > lastIndex) {
        result.push(text.slice(lastIndex, start));
      }
      // Add matched text
      result.push(
        <mark key={i} className="bg-yellow-200">
          {text.slice(start, end + 1)}
        </mark>
      );
      lastIndex = end + 1;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return <>{result}</>;
  }

  // Exact match fallback
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200">{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
}

/**
 * Helper to extract match indices for a specific key from Fuse.js matches.
 */
export function getMatchesForKey(matches: readonly any[] | undefined, key: string): readonly [number, number][] | undefined {
  return matches?.find(m => m.key === key)?.indices;
}
