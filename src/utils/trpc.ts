import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "~/server/api/root";

// Create a tRPC instance
export const trpc = createTRPCReact<AppRouter>();
