/**
 * Obtiene el primer día del mes actual a las 00:00:00
 */
export const getStartOfCurrentMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
};

/**
 * Obtiene el último día del mes actual a las 23:59:59.999
 */
export const getEndOfCurrentMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
};

/**
 * Obtiene el primer día de un mes específico
 */
export const getStartOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1, 0, 0, 0, 0);
};

/**
 * Obtiene el último día de un mes específico
 */
export const getEndOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
};

/**
 * Formatea una fecha como ISO string para queries de Supabase
 */
export const toISOString = (date: Date): string => {
  return date.toISOString();
};

/**
 * Formatea un mes como "Mes Año" (ej: "Diciembre 2024")
 */
export const formatMonthYear = (year: number, month: number): string => {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
};

/**
 * Formatea un mes como "Mes YYYY" capitalizado (ej: "Diciembre 2024")
 */
export const formatMonthYearCapitalized = (year: number, month: number): string => {
  const formatted = formatMonthYear(year, month);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

/**
 * Extrae año y mes de una fecha ISO string
 */
export const extractYearMonth = (isoDate: string): { year: number; month: number } => {
  const date = new Date(isoDate);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
  };
};

/**
 * Obtiene una lista de meses desde una fecha hasta hoy (sin incluir mes actual)
 */
export const getMonthsRange = (fromDate: Date): Array<{ year: number; month: number }> => {
  const months: Array<{ year: number; month: number }> = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let year = fromDate.getFullYear();
  let month = fromDate.getMonth();

  while (year < currentYear || (year === currentYear && month < currentMonth)) {
    months.push({ year, month });
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return months.reverse(); // Más recientes primero
};

