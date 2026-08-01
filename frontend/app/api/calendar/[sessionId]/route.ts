export async function GET(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> },
) {
    const { sessionId } = await params;

    try {
        const backendRes = await fetch(
            `${process.env.BACKEND_URL}/calendar/${sessionId}/plan.ics`,
        );

        if (!backendRes.ok) {
            return new Response(null, { status: backendRes.status });
        }

        const body = await backendRes.arrayBuffer();
        return new Response(body, {
            status: 200,
            headers: {
                "Content-Type": "text/calendar",
                "Content-Disposition": 'attachment; filename="plan.ics"',
            },
        });
    } catch (e) {
        console.error("Error in calendar download handler:", e);
        return new Response(null, { status: 500 });
    }
}
