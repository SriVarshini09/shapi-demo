export async function uploadReport(token: string, channel: string, content: string) {
  const filename = "report.txt";
  const bytes = new TextEncoder().encode(content);

  // Step 1: ask Slack for an upload URL and file id (replaces the retired files.upload).
  const urlRes = await fetch("https://slack.com/api/files.getUploadURLExternal", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ filename, length: String(bytes.byteLength) }),
  });
  const urlData = await urlRes.json();
  if (!urlData.ok) throw new Error(`Slack upload failed: ${urlData.error}`);
  const fileId: string = urlData.file_id;

  // Step 2: send the file bytes to the upload URL.
  const putRes = await fetch(urlData.upload_url, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: bytes,
  });
  if (!putRes.ok) throw new Error(`Slack upload failed: upload_url returned ${putRes.status}`);

  // Step 3: finish the upload and share it to the channel.
  const completeRes = await fetch("https://slack.com/api/files.completeUploadExternal", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({ files: [{ id: fileId, title: filename }], channel_id: channel }),
  });
  const completeData = await completeRes.json();
  if (!completeData.ok) throw new Error(`Slack upload failed: ${completeData.error}`);
  return fileId;
}
