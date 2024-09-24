export async function GET() {
  return new Response(null, {
    status: process.env.API_KEY ? 200 : 204,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
