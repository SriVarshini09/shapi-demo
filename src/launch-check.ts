// Launch smoke test (2026-10-31): a QuickBooks call still pinned to minor version 65, for SHAPI to fix.
// Removed again once the fix PR is checked (rerun after the contract-test naming fix).
const QBO = "https://quickbooks.api.intuit.com";

export async function companyName(realmId: string, accessToken: string) {
  const res = await fetch(`${QBO}/v3/company/${realmId}/companyinfo/${realmId}?minorversion=65`, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
  });
  const body = await res.json();
  return body.CompanyInfo.CompanyName;
}
