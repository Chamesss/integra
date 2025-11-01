// format date to 'MMM DD, YYYY - HH:MM' format without AM/PM
export const dateToMonthDayYearTime = (dateValue: string | Date | null) => {
  if (!dateValue) return "Non spécifié";
  const dateFormat = new Date(dateValue);
  const formattedDate = dateFormat.toLocaleDateString(`fr-US`, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dateFormat.toLocaleTimeString(`fr-US`, {
    hour: "numeric",
    minute: "numeric",
  });
  return `${formattedDate} - ${formattedTime}`;
};
