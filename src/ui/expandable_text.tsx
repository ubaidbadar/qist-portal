import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

export interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  enabled?: boolean;
  className?: string;
  buttonClassName?: string;
  collapsedButtonBackgroundClassName?: string;
  expandLabel?: string;
  collapseLabel?: string;
}

function ExpandableTextContent({
  text,
  maxLines = 4,
  enabled = true,
  className = '',
  buttonClassName = '',
  collapsedButtonBackgroundClassName = 'bg-surface',
  expandLabel = 'See more',
  collapseLabel = 'See less',
}: ExpandableTextProps) {
  const contentId = useId();
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const lineLimit = Number.isFinite(maxLines) ? Math.max(1, Math.floor(maxLines)) : 4;
  const isClamped = enabled && !isExpanded;

  // Overflow can only be measured while the text is clamped; when expanded, the last measurement holds.
  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!isClamped || !element) return;

    const observer = new ResizeObserver(() => {
      // A one-pixel tolerance avoids false positives from fractional layout values.
      setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [isClamped, lineLimit]);

  const clampStyles: CSSProperties | undefined = isClamped
    ? { display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: lineLimit, overflow: 'hidden' }
    : undefined;

  return (
    <div className="relative">
      <p id={contentId} ref={contentRef} className={className} style={clampStyles}>
        {text}
      </p>
      {enabled && (isExpanded || isOverflowing) && (
        <button
          type="button"
          aria-controls={contentId}
          aria-expanded={isExpanded}
          onClick={(event) => {
            event.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
          className={`rounded-small text-sm font-semibold text-muted transition-colors cursor-pointer hover:text-ink ${
            isExpanded ? 'ml-auto mt-1 block' : `absolute bottom-0 right-0 pl-2 ${collapsedButtonBackgroundClassName}`
          } ${buttonClassName}`}
        >
          {isExpanded ? collapseLabel : expandLabel}
        </button>
      )}
    </div>
  );
}

export default function ExpandableText(props: ExpandableTextProps) {
  // Remounting on text changes guarantees expansion state never leaks between posts.
  return <ExpandableTextContent key={props.text} {...props} />;
}
