import axios from "axios";

const hubspot = axios.create({ baseURL: "https://api.hubapi.com" });

export async function dealStages(token: string) {
  const resp = await hubspot.get("/crm/pipelines/2026-09/deals", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return resp.data.results.flatMap((p: { stages: unknown[] }) => p.stages);
}
