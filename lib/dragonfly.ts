export interface Package {
    scan_id: string,
    name: string,
    version: string,
    status: string | null,
    score: number | null,
    inspector_url: string | null,
    rules: string[] | null,
    download_urls: string[] | null,
    queued_at: number,
    queued_by: string,
    pending_at: number | null,
    pending_by: string | null,
    reported_at: number | null,
    reported_by: string | null,
    finished_at: number | null,
    finished_by: string | null,
    commit_hash: string | null,
}

interface Query {
    name?: string,
    version?: string,
    since?: Date,
}

export async function queryPackages({ name, version, since }: Query, accessToken: string): Promise<Package[]> {
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
    const response = await fetch("https://dragonfly-staging.vipyrsec.com/package?" + qs.toString(), {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        },
    });

    return response.json();
}
