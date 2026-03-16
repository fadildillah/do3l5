'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface InteractiveLinkProps {
  href: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  ariaLabel?: string;
}

export default function InteractiveLink({ href, children, style, className, ariaLabel }: InteractiveLinkProps) {
  return (
    <Link
      href={href}
      style={{
        ...style,
        transition: 'color 0.15s ease, border-color 0.15s ease',
        minHeight: '44px',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      className={`interactive-link ${className || ''}`}
      aria-label={ariaLabel}
      onPointerEnter={(e) => (e.currentTarget.style.color = '#c8a84b')}
      onPointerLeave={(e) => (e.currentTarget.style.color = style?.color || '')}
    >
      {children}
    </Link>
  );
}
