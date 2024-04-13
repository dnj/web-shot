import en  from "./locales/en.json";
import fa from "./locales/fa.json";

export default defineI18nConfig(() => ({
    legacy: false,
    locale: 'fa',
    messages: {
        en: en,
        fa: fa
    }
}))