import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from '../utils/en.json';
import viTranslation from '../utils/vi.json';
i18n.use(initReactI18next) // gắn react-i18next với i18n
    .init({
        resources: {
            en: {
                translation: enTranslation,
            },
            vi: {
                translation: viTranslation,
            },
        },
        lng: 'en', // Ngôn ngữ mặc định
        fallbackLng: 'en', // Ngôn ngữ dự phòng nếu không tìm thấy ngôn ngữ nào khác
        interpolation: {
            escapeValue: false, // không escape các ký tự đặc biệt
        },
    });

export default i18n;
