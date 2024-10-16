const MAINFRAME_API_URL: string =
  process.env.MAINFRAME_API_URL || "http://localhost:8000";

export interface Package {
  scan_id: string;
  name: string;
  version: string;
  status: string | null;
  score: number | null;
  inspector_url: string | null;
  rules: string[] | null;
  download_urls: string[] | null;
  queued_at: number;
  queued_by: string;
  pending_at: number | null;
  pending_by: string | null;
  reported_at: number | null;
  reported_by: string | null;
  finished_at: number | null;
  finished_by: string | null;
  commit_hash: string | null;
}

interface Query {
  name?: string;
  version?: string;
  since?: Date;
}

export async function queryPackages(
  { name, version, since }: Query,
  accessToken: string,
): Promise<Package[]> {
  const qs = new URLSearchParams();
  if (name) {
    qs.append("name", name);
  }
  if (version) {
    qs.append("version", version);
  }
  if (since) {
    qs.append("since", Math.floor(since.getTime() / 1000).toString());
  }
  const response = await fetch(MAINFRAME_API_URL + "?" + qs.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.json();
}

export interface ReportPackageBody {
  name: string;
  version: string;
  additionalInformation: string | null;
  inspectorUrl: string | null;
}

export class DragonflyError extends Error {
  method: string;
  url: string;
  statusCode: number;
  body: any;

  constructor(method: string, url: string, statusCode: number, body: any) {
    super();
    this.method = method;
    this.url = url;
    this.statusCode = statusCode;
    this.body = body;
  }
}

export async function reportPackage(
  { name, version, additionalInformation, inspectorUrl }: ReportPackageBody,
  accessToken: string,
) {
  const url = MAINFRAME_API_URL + "/report";
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      name,
      version,
      additional_information: additionalInformation,
      inspector_url: inspectorUrl,
    }),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const json = await response.json();

  if (!response.ok)
    throw new DragonflyError("POST", url, response.status, json);
}
