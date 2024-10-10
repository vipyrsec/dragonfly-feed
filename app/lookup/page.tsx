import { getAccessToken } from "@auth0/nextjs-auth0";
import { queryPackages } from "@/lib/dragonfly";
import Feed from "@/components/feed";
import dayjs from "dayjs";

export default async function lookupPage({ searchParams }) {
    const since = searchParams.since ? dayjs.unix(searchParams.since).toDate() : undefined;
    const { accessToken } = await getAccessToken();
    const q = {name: searchParams.name, version: searchParams.version, since};
    const packages = await queryPackages(q, accessToken || "");
    return (
        <div className="flex justify-center">
            <Feed packages={packages} />
        </div>
    )
}
