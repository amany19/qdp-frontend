'use client';

import { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * FadeIn animation wrapper
 * Smoothly fades in content when it appears
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = ''
}: FadeInProps) {
  return (
    <div
      className={`animate-fade-in ${className}`}
      style={{
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      {children}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

/**
 * Stagger animation wrapper for lists
 * Animates children with increasing delays
 */
export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className = ''
}: {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.isArray(children) && children.map((child, index) => (
        <FadeIn key={index} delay={index * staggerDelay}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
