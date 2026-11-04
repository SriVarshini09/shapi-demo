export async function uploadReport(token: string, channel: string, content: string) {
  const res = await fetch("https://slack.com/api/files.upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ channels: channel, content, filename: "report.txt" }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack upload failed: ${data.error}`);
  return data.file.id;
}
