import { getAccessToken } from "@auth0/nextjs-auth0";
import { queryPackages } from "@/lib/dragonfly";
import Feed from "@/components/feed";

export default async function test() {
    const since = new Date(Date.now() - 60000); // One minute ago
    const { accessToken } = await getAccessToken();
    const packages = await queryPackages({since}, accessToken || "");
    return (
        <div className="flex justify-center">
            <Feed packages={packages} />
        </div>
    )
}
