
import { checkDatabaseConnection } from "@/app/lib/db";

export async function GET() {
    const isConnected = await checkDatabaseConnection();

    if (isConnected) {
        return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ status: "error", message: "Database connection failed" }), { status: 503 });
    }
}
