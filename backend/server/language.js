export function normalizeLang(lang) {
  if (!lang) return "en";
  if (lang.startsWith("am")) return "am";
  if (lang.startsWith("om")) return "om";
  return "en";
}