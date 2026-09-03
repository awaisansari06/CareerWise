/**
 * Salary Currency & Formatting Utilities (INR / Indian Job Market)
 *
 * Provides utilities to:
 * 1. Format numerical amounts into Indian numbering system (Lakhs / Crores / ₹)
 * 2. Format salary ranges cleanly
 * 3. Validate whether an IndustryInsight record contains valid Indian Rupee salary data
 */

/**
 * Format a numerical salary into standard Indian Rupee format (e.g. ₹4,00,000 or ₹12,50,000)
 * @param {number} amount - The salary amount in INR
 * @returns {string} Formatted string with ₹ symbol and Indian grouping
 */
export function formatInrSalary(amount) {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "₹0";
  }
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/**
 * Format a salary range in Indian Rupees (e.g. ₹4,00,000 – ₹8,00,000)
 * @param {number} min - Minimum salary
 * @param {number} max - Maximum salary
 * @returns {string}
 */
export function formatInrSalaryRange(min, max) {
  return `${formatInrSalary(min)} – ${formatInrSalary(max)}`;
}

/**
 * Format a salary into compact Lakhs format (e.g. 8.5L or 12L) for chart axes/tags
 * @param {number} amount - The salary in INR
 * @returns {string}
 */
export function formatInrLakhs(amount) {
  if (typeof amount !== "number" || isNaN(amount)) return "₹0";
  const lakhs = amount / 100000;
  // If integer, show without decimal; else 1 decimal place
  const formatted = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1);
  return `₹${formatted}L`;
}

/**
 * Determine if an IndustryInsight record possesses valid INR salary data.
 *
 * In the Indian job market, annual salaries for white-collar/professional industry roles
 * typically start around ₹2,50,000 - ₹4,00,000 and can extend to ₹50,00,000+.
 *
 * Legacy cached records in USD had typical US values such as:
 * min: 35,000 - 80,000, max: 80,000 - 150,000, median: 45,000 - 120,000,
 * or location: "United States" / "US".
 *
 * If max salary is < 200,000 across all roles or location specifies United States/US,
 * the record is legacy USD data and needs regeneration for INR compliance.
 *
 * @param {object} insight - IndustryInsight database object
 * @returns {boolean} True if the insight contains valid INR salary figures
 */
export function hasValidInrSalaryData(insight) {
  if (!insight) return false;
  const salaryRanges = insight.salaryRanges;
  if (!Array.isArray(salaryRanges) || salaryRanges.length === 0) {
    // If empty array, allow regeneration
    return false;
  }

  // Check if any role has explicit non-India location
  const hasUsLocation = salaryRanges.some((r) => {
    const loc = (r?.location || "").toLowerCase();
    return loc.includes("united states") || loc === "us" || loc.includes("usa");
  });
  if (hasUsLocation) return false;

  // Check numerical magnitudes:
  // In INR, professional tech/office/finance salaries have median/max >= 2,00,000 (200k).
  // In USD, salaries were typically 40,000 - 180,000.
  // We check if the average or max across the roles reaches typical INR annual CTC thresholds.
  const maxValues = salaryRanges.map((r) => Number(r?.max) || 0);
  const highestMax = Math.max(...maxValues, 0);

  // If the absolute highest maximum across all roles is under 200,000, it is definitely legacy USD data
  if (highestMax < 200000) {
    return false;
  }

  return true;
}
