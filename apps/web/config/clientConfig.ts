import { z } from 'zod';
import { NETWORK, PACKAGE_ID } from 'contracts/deployment';
/*
 * The schema for the client-side environment variables
 * These variables should be defined in the app/.env file
 * These variables are NOT SECRET, they are exposed to the client side
 * They can and should be tracked by Git
 * All of the env variables must have the NEXT_PUBLIC_ prefix
 */
const network = NETWORK === 'localnet' ? 'testnet' : NETWORK;

const clientConfigSchema = z.object({
  SUI_NETWORK: z.string(),
  SUI_NETWORK_NAME: z.enum(['mainnet', 'testnet']),
  ENOKI_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  PACKAGE_ID: z.string(),
});

const clientConfig = clientConfigSchema.parse({
  SUI_NETWORK: NETWORK,
  SUI_NETWORK_NAME: network as 'mainnet' | 'testnet',
  ENOKI_API_KEY: process.env.NEXT_PUBLIC_ENOKI_API_KEY!,
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  PACKAGE_ID: PACKAGE_ID,
});

export default clientConfig;
