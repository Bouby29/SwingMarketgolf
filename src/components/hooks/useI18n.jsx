import { useTranslation } from 'react-i18next';
import { useLanguage } from '../providers/I18nProvider';

export function useI18n() {
  const { t, i18n } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  return {
    t,
    i18n,
    language,
    changeLanguage,
    currentLocale: language
  };
}

export default useI18n;