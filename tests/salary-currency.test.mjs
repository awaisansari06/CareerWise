import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatInrSalary,
  formatInrSalaryRange,
  formatInrLakhs,
  hasValidInrSalaryData,
} from "../lib/salary-utils.js";

describe("Salary Currency & Formatting (INR / Indian Job Market)", () => {
  it("1. formatInrSalary formats numbers into standard Indian Rupee notation", () => {
    assert.equal(formatInrSalary(400000), "₹4,00,000");
    assert.equal(formatInrSalary(850000), "₹8,50,000");
    assert.equal(formatInrSalary(1200000), "₹12,00,000");
    assert.equal(formatInrSalary(1550000), "₹15,50,000");
    assert.equal(formatInrSalary(3500000), "₹35,00,000");
  });

  it("2. formatInrSalary handles edge cases safely", () => {
    assert.equal(formatInrSalary(0), "₹0");
    assert.equal(formatInrSalary(null), "₹0");
    assert.equal(formatInrSalary(undefined), "₹0");
    assert.equal(formatInrSalary("string"), "₹0");
  });

  it("3. formatInrSalaryRange formats ranges cleanly", () => {
    assert.equal(formatInrSalaryRange(400000, 800000), "₹4,00,000 – ₹8,00,000");
    assert.equal(formatInrSalaryRange(600000, 1500000), "₹6,00,000 – ₹15,00,000");
  });

  it("4. formatInrLakhs formats values in Lakhs for compact chart axes", () => {
    assert.equal(formatInrLakhs(800000), "₹8L");
    assert.equal(formatInrLakhs(850000), "₹8.5L");
    assert.equal(formatInrLakhs(1200000), "₹12L");
    assert.equal(formatInrLakhs(1550000), "₹15.5L");
  });

  it("5. hasValidInrSalaryData returns false for legacy USD data", () => {
    // US salary values (50k - 150k USD, or US locations)
    const legacyUsdInsight1 = {
      industry: "Office Administration",
      salaryRanges: [
        { role: "Admin Assistant", min: 35000, max: 55000, median: 45000 },
        { role: "Office Manager", min: 55000, max: 85000, median: 68000 },
      ],
    };
    assert.equal(hasValidInrSalaryData(legacyUsdInsight1), false);

    const legacyUsdInsight2 = {
      industry: "Finance & Accounting",
      salaryRanges: [
        { role: "Staff Accountant", min: 60000, max: 80000, median: 70000, location: "United States" },
      ],
    };
    assert.equal(hasValidInrSalaryData(legacyUsdInsight2), false);
  });

  it("6. hasValidInrSalaryData returns true for valid INR data", () => {
    const validInrInsight = {
      industry: "Information Technology & Software Development",
      salaryRanges: [
        { role: "Junior Software Engineer", min: 500000, max: 900000, median: 700000, location: "India" },
        { role: "Full Stack Developer", min: 600000, max: 1200000, median: 850000, location: "India" },
      ],
    };
    assert.equal(hasValidInrSalaryData(validInrInsight), true);
  });

  it("7. hasValidInrSalaryData handles empty or malformed inputs safely", () => {
    assert.equal(hasValidInrSalaryData(null), false);
    assert.equal(hasValidInrSalaryData({}), false);
    assert.equal(hasValidInrSalaryData({ salaryRanges: [] }), false);
  });
});
