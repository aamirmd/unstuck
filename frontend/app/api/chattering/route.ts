function corsResponse(status: number, body: string) {
    return new Response(body, {
        status,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Content-Type": "application/json",
        },
    });
}

export async function OPTIONS() {
    return corsResponse(200, "");
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const backendRes = await fetch(
            `${process.env.BACKEND_URL}/chattering`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
        );

        const data = await backendRes.json();
        return corsResponse(backendRes.status, JSON.stringify(data));
    } catch (e) {
        console.error("Error in chattering handler:", e);
        return corsResponse(
            500,
            JSON.stringify({ error: "Chat request failed" }),
        );
    }
}
