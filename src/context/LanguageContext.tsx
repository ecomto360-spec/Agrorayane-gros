import React, { createContext, useContext, useState } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    catalog: 'Catalogue',
    cart: 'Panier',
    search: 'Rechercher un produit...',
    available: 'Disponible',
    unavailable: 'Non Dispo',
    add_to_cart: 'Ajouter',
    request_order: 'Demander la commande',
    checkout: 'Validation',
    qty: 'Qté',
    all_categories: 'Tout',
    my_orders: 'Mes Commandes',
    order_success: 'Demande envoyée !',
  },
  ar: {
    catalog: 'الكتالوج',
    cart: 'السلة',
    search: 'البحث عن منتج...',
    available: 'متوفر',
    unavailable: 'غير متوفر',
    add_to_cart: 'إضافة',
    request_order: 'طلب الطلبية',
    checkout: 'تأكيد',
    qty: 'الكمية',
    all_categories: 'الكل',
    my_orders: 'طلباتي',
    order_success: 'تم إرسال الطلب!',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('fr');

  const t = (key: string) => {
    return translations[lang]?.[key] || key;
  };

  const isRtl = lang === 'ar';

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl }}>
      <div dir={isRtl ? 'rtl' : 'ltr'}>{children}</div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
