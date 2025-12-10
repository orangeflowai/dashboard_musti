'use client';

import LanguageToggle from './LanguageToggle';

interface DashboardHeaderProps {
  userEmail: string;
}

export default function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  return (
    <div className="flex items-center space-x-4">
      <LanguageToggle />
      <span className="text-sm" style={{ color: '#666666' }}>{userEmail}</span>
      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
          style={{ color: '#B91C1C' }}
        >
          Sign out
        </button>
      </form>
    </div>
  );
}


