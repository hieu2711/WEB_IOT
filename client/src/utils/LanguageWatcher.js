import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import i18n from './translate';

function LanguageWatcher() {
    const language = useSelector((state) => state.language.language);

    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language]);

    return null;
}

export default LanguageWatcher;
