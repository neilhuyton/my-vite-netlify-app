import { Context } from "@netlify/functions";

interface NetlifyEvent {
  httpMethod: string;
  headers: Record<string, string>;
  body: string | null;
  queryStringParameters: Record<string, string>;
}

export async function handler(event: NetlifyEvent, context: Context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from Netlify Functions with TypeScript!",
    }),
  };
}
