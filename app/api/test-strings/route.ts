export async function GET() {
    try {
        const backendUrl = process.env.BACKEND_URL;

        const response = await fetch(`${backendUrl}/append-dooly`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: "Hola" }),
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Response from FastAPI backend:", data);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        console.error("Error calling FastAPI backend:", error);
        return new Response(
            JSON.stringify({ error: "Failed to call backend" }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            },
        );
    }
}
