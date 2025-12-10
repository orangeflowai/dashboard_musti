'use client';

import { useTranslation } from 'react-i18next';
import { saveLanguage } from '@/i18n/config';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language as 'en' | 'it';

  const handleLanguageChange = (language: 'en' | 'it') => {
    saveLanguage(language);
  };

  return (
    <div style={{ display: 'flex', gap: '4px', backgroundColor: '#FFFAEC', borderRadius: '8px', padding: '2px' }}>
      <button
        onClick={() => handleLanguageChange('en')}
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: currentLanguage === 'en' ? '#B91C1C' : 'transparent',
          color: currentLanguage === 'en' ? '#FFFFFF' : '#666666',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'PPNeueMontreal-Medium, sans-serif',
          minWidth: '50px',
        }}
      >
        EN
      </button>
      <button
        onClick={() => handleLanguageChange('it')}
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: currentLanguage === 'it' ? '#B91C1C' : 'transparent',
          color: currentLanguage === 'it' ? '#FFFFFF' : '#666666',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'PPNeueMontreal-Medium, sans-serif',
          minWidth: '50px',
        }}
      >
        IT
      </button>
    </div>
  );
}


