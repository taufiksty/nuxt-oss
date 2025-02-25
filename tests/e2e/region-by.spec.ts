import test, { expect } from "@playwright/test";

test.describe("Regions By Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("User clicks link page of regions by, select region by region, and see a recap", async ({
    page,
  }) => {
    await page.click('a[href="/regions/by"]');

    await expect(page).toHaveURL("/regions/by");

    // Province table
    const tableProvince = page.getByTestId("province-table");
    await expect(tableProvince).toBeVisible();

    const rowsProvince = tableProvince.locator("tbody tr");
    await expect(rowsProvince).toHaveCount(38);

    await tableProvince.locator("#v-13").click();

    // City table
    const tableCity = page.getByTestId("city-table");
    await expect(tableCity).toBeVisible();

    const rowsCity = tableCity.locator("tbody tr");
    await expect(rowsCity).toHaveCount(6);

    await tableCity.locator("#v-41").click();

    // District table
    const tableDistrict = page.getByTestId("district-table");
    await expect(tableDistrict).toBeVisible();

    const rowsDistrict = tableDistrict.locator("tbody tr");
    await expect(rowsDistrict).toHaveCount(10);

    await tableDistrict.locator("#v-44").click();

    // Village table
    const tableVillage = page.getByTestId("village-table");
    await expect(tableVillage).toBeVisible();

    const rowsVillage = tableVillage.locator("tbody tr");
    await expect(rowsVillage).toHaveCount(7);

    await tableVillage.locator("#v-54").click();

    // Recap
    const recap = page.getByTestId("recap");
    await expect(recap).toContainText(
      "Rekap lokasi usahamu: DKI Jakarta, Kota Adm. Jakarta Selatan, Tebet, Tebet Barat"
    );
  });

  test("User clicks export to csv on province table", async ({ page }) => {
    await page.click('a[href="/regions/by"]');

    await expect(page).toHaveURL("/regions/by");

    const exportCsvProvinceButton = page.getByTestId("export-province-csv");

    await expect(exportCsvProvinceButton).toBeVisible();
    await exportCsvProvinceButton.click();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      exportCsvProvinceButton.click(),
    ]);

    expect(download.suggestedFilename()).toContain("provinsi.csv");
  });

  test("User clicks export to pdf on province table", async ({ page }) => {
    await page.click('a[href="/regions/by"]');

    await expect(page).toHaveURL("/regions/by");

    const exportCsvProvinceButton = page.getByTestId("export-province-pdf");

    await expect(exportCsvProvinceButton).toBeVisible();
    await exportCsvProvinceButton.click();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      exportCsvProvinceButton.click(),
    ]);

    expect(download.suggestedFilename()).toContain("provinsi.pdf");
  });
});
