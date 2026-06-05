import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../server/router";
import { useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export const trpc = createTRPCReact<AppRouter>();

function makeClients() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,      // 1 minute — data is fresh, no refetch
        gcTime: 1000 * 60 * 5,    // keep in cache for 5 minutes after unmount
        retry: 1,                  // retry failed requests once
        refetchOnWindowFocus: false, // don't refetch when user alt-tabs back
      },
    },
  });
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: "/api/trpc",
        transformer: superjson,
        async headers() {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
  return { queryClient, trpcClient };
}

export function TRPCProvider({ children }: { children: ReactNode }) {
  const [{ queryClient, trpcClient }] = useState(makeClients);
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
