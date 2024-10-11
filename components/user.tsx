"use client"
import { useUser } from "@auth0/nextjs-auth0/client";
import Link from "next/link";

export default function LoggedInUserWidget() {
    const { user, error, isLoading } = useUser();
    if(!user || isLoading || error) return;
    
    return (
        <div className="grid gap-x-4 gap-y-0 grid-rows-2 grid-cols-2 items-center px-4 py-2">
            <img src={user.picture || ""} className="w-16 h-16 rounded-full border overflow-hidden row-span-2"/>
            <p className="text-lg">{user.name}</p>
            <Link href={"/api/auth/logout"} className="text-sm text-muted-primary hover:underline">Log out</Link>
        </div>
    )

}
