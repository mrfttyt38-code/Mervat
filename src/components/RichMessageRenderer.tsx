import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface RichMessageRendererProps {
  content: string;
  className?: string;
}

interface Segment {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

function splitMarkdownSegments(raw: string): Segment[] {
  const segments: Segment[] = [];
  const fenceRegex = /```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)(?:```|$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: raw.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'code',
      language: (match[1] || 'code').trim(),
      content: match[2].replace(/\n$/, ''),
    });
    lastIndex = fenceRegex.lastIndex;
  }

  if (lastIndex < raw.length) {
    segments.push({
      type: 'text',
      content: raw.slice(lastIndex),
    });
  }

  return segments;
}

function renderInlineFormatting(text: string): React.ReactNode[] {
  // Handle inline code `...`, bold **...**, italic *...*
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={`ic-${keyIdx++}`}
          dir="ltr"
          className="inline-block px-1.5 py-0.5 mx-0.5 rounded bg-slate-800/90 border border-slate-700/70 text-amber-300 font-mono text-[0.85em]"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(
        <strong key={`b-${keyIdx++}`} className="font-bold text-white">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(
        <em key={`i-${keyIdx++}`} className="italic text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

const CodeBlock: React.FC<{ code: string; language?: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      dir="ltr"
      className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-[#080b12] text-left shadow-md"
    >
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 font-mono text-slate-300">
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span>{language || 'code'}</span>
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">تم النسخ</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>نسخ الكود</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs sm:text-[13px] leading-relaxed font-mono text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
};

function renderTextBlock(block: string, baseKey: string): React.ReactNode {
  const lines = block.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      elements.push(<hr key={`${baseKey}-hr-${i}`} className="my-4 border-slate-800" />);
      i++;
      continue;
    }

    // Headings
    const hMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length;
      const headingText = hMatch[2];
      const cls =
        level === 1
          ? 'text-lg font-bold text-amber-300 mt-4 mb-2'
          : level === 2
          ? 'text-base font-bold text-amber-400 mt-3.5 mb-2'
          : 'text-sm sm:text-[15px] font-bold text-amber-300 mt-3 mb-1.5';
      elements.push(
        <div key={`${baseKey}-h-${i}`} className={cls}>
          {renderInlineFormatting(headingText)}
        </div>
      );
      i++;
      continue;
    }

    // Markdown table detection
    if (trimmed.startsWith('|') && i + 1 < lines.length && /^\s*\|[\s:-]+\|/.test(lines[i + 1])) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const parseRow = (row: string) =>
        row
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map((c) => c.trim());

      const headers = parseRow(tableLines[0]);
      const rows = tableLines.slice(2).map(parseRow);

      elements.push(
        <div key={`${baseKey}-tbl-${i}`} className="my-3 overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-xs sm:text-sm text-right border-collapse">
            <thead className="bg-slate-900/90 text-amber-300 border-b border-slate-800">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="px-3 py-2 font-bold">
                    {renderInlineFormatting(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-900/40">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-slate-200 tabular-nums">
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`${baseKey}-q-${i}`}
          className="my-3 px-4 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-300 text-sm leading-relaxed"
        >
          {renderInlineFormatting(quoteLines.join(' '))}
        </blockquote>
      );
      continue;
    }

    // Unordered list
    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*•]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={`${baseKey}-ul-${i}`} className="my-2 space-y-1.5 pr-4 list-disc marker:text-amber-400">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed text-slate-200">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+[.)]\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={`${baseKey}-ol-${i}`} className="my-2 space-y-1.5 pr-5 list-decimal marker:text-amber-400 marker:font-semibold">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed text-slate-200">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Standard paragraph (collect consecutive normal lines)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,4})\s+/.test(lines[i].trim()) &&
      !/^[-*•]\s+/.test(lines[i].trim()) &&
      !/^\d+[.)]\s+/.test(lines[i].trim()) &&
      !lines[i].trim().startsWith('>') &&
      !lines[i].trim().startsWith('|') &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    elements.push(
      <p key={`${baseKey}-p-${i}`} className="my-2 leading-relaxed text-slate-200 whitespace-pre-wrap">
        {renderInlineFormatting(paraLines.join('\n'))}
      </p>
    );
  }

  return elements;
}

export const RichMessageRenderer: React.FC<RichMessageRendererProps> = ({ content, className = '' }) => {
  const segments = splitMarkdownSegments(content);

  return (
    <div className={`space-y-1 text-sm leading-relaxed ${className}`}>
      {segments.map((seg, idx) =>
        seg.type === 'code' ? (
          <CodeBlock key={`seg-${idx}`} code={seg.content} language={seg.language} />
        ) : (
          <React.Fragment key={`seg-${idx}`}>
            {renderTextBlock(seg.content, `seg-${idx}`)}
          </React.Fragment>
        )
      )}
    </div>
  );
};
