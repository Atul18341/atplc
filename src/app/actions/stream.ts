'use server';

// 🔑 IMPORT FROM THE SECURE NODE SDK INSTEAD
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";
const streamSecret = process.env.STREAM_SECRET_KEY || "";

/**
 * 🚀 Generates a highly secure RTC authentication token for active users
 */
export async function getStreamToken(userId: string): Promise<string> {
  if (!apiKey || !streamSecret) {
    throw new Error("Stream API keys are missing inside your server environment variables.");
  }

  // 1. Initialize the official backend Server Client
  const serverClient = new StreamClient(apiKey, streamSecret);
  
  // 2. Token expiration configuration (e.g., valid for 2 hour)
  const validity = Math.floor(Date.now() / 1000) + 7200;

  // 3. Generate the token cleanly using the backend method
  const token = serverClient.generateUserToken({ 
    user_id: String(userId), 
    validity_in_seconds: validity 
  });

  return token;
}