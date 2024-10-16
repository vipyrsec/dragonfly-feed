'use server'

import { getSession } from "@auth0/nextjs-auth0"
import { DragonflyError, reportPackage, ReportPackageBody } from "./lib/dragonfly"

export async function reportPackageAction(body: ReportPackageBody) {
    const session = await getSession();
    if(typeof session?.accessToken !== "string") return { error: "Not authenticated." };

    try {
        await reportPackage(body, session.accessToken);
    } catch(e) {
        // Server actions must return serializable errors to the client
        if(e instanceof DragonflyError) {
            return { error: `${e.statusCode}: ${e.body.detail}` }
        } else {
            console.error("Error occured in report server action:", e);
            return { error: "An unknown error occured." };
        }
    }
}
