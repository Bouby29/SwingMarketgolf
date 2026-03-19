import React from 'react';
import { useTranslate } from '../providers/TranslationProvider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' }
];

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useTranslate();
  const currentLang = LANGUAGES.find(l => l.code === language);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32 border-gray-200 rounded-lg">
          <SelectValue>
            {currentLang && (
              <span className="flex items-center gap-2">
                <span>{currentLang.flag}</span>
                <span className="hidden sm:inline text-xs font-medium">{currentLang.name}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}