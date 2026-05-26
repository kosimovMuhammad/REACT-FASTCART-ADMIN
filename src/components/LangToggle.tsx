import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export function LangToggle() {
  const { i18n } = useTranslation();

  const toggleLang = () => {
    const nextLang = i18n.language === "ru" ? "en" : "ru";
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLang}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1 text-sm font-medium"
      title="Toggle Language"
    >
      <Globe className="h-5 w-5" />
      <span className="uppercase">{i18n.language || "en"}</span>
    </button>
  );
}
