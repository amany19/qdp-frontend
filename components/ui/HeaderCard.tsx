'use client';
import React, { ReactNode } from 'react';

interface HeaderCardProps {
  title: string;
  leftButton?: ReactNode;
  rightButton?: ReactNode;
}

export default function HeaderCard({ title, leftButton, rightButton }: HeaderCardProps) {
  return (
    <div className="bg-white px-5 py-3 border-b border-gray-100 rounded-b-4xl shadow-sm mb-1">
      <div className="flex items-center justify-between">
        <div>{leftButton}</div>
        <h1 className="text-lg font-bold pl-6 text-gray-900">{title}</h1>
        <div>{rightButton}</div>
      </div>
    </div>
  );
}