// LanguageWatcher.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import i18n from './translate'; // Import i18n cùng với cấu hình của bạn

function LanguageWatcher() {
    const language = useSelector((state) => state.language.language);

    useEffect(() => {
        // Cập nhật ngôn ngữ trong i18n khi có sự thay đổi trong Redux state
        i18n.changeLanguage(language);
    }, [language]); // Kích hoạt lại useEffect mỗi khi giá trị ngôn ngữ trong Redux state thay đổi

    return null; // Vì không có giao diện nên trả về null
}

export default LanguageWatcher;
