export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return "0,000 TND";

  const parts = numValue.toFixed(3).split(".");
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const decimalPart = parts[1];

  return `${integerPart},${decimalPart} TND`;
};

export const formatAmountInWords = (amount: number): string => {
  const units = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];

  const tens = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante-dix",
    "quatre-vingt",
    "quatre-vingt-dix",
  ];

  const convertToWords = (num: number): string => {
    if (num === 0) return "zéro";
    if (num < 20) return units[num];
    if (num < 100) {
      const ten = Math.floor(num / 10);
      const unit = num % 10;
      if (ten === 7)
        return "soixante-" + (unit === 0 ? "dix" : convertToWords(10 + unit));
      if (ten === 9)
        return (
          "quatre-vingt-" + (unit === 0 ? "dix" : convertToWords(10 + unit))
        );
      return tens[ten] + (unit > 0 ? "-" + units[unit] : "");
    }
    if (num < 1000) {
      const hundred = Math.floor(num / 100);
      const remainder = num % 100;
      let result = hundred === 1 ? "cent" : units[hundred] + " cent";
      if (hundred > 1 && remainder === 0) result += "s";
      if (remainder > 0) result += " " + convertToWords(remainder);
      return result;
    }
    if (num < 1000000) {
      const thousand = Math.floor(num / 1000);
      const remainder = num % 1000;
      let result =
        thousand === 1 ? "mille" : convertToWords(thousand) + " mille";
      if (remainder > 0) result += " " + convertToWords(remainder);
      return result;
    }
    return num.toString(); // For larger numbers, just return the number
  };

  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 1000);

  let result = convertToWords(integerPart);
  result += integerPart <= 1 ? " Dinar" : " Dinars";

  if (decimalPart > 0) {
    result += " et " + convertToWords(decimalPart);
    result += decimalPart <= 1 ? " Millime" : " Millimes";
  }

  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
};

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
