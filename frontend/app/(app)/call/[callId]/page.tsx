import { Suspense } from "react";
import { CallSession } from "@/features/call/components/CallSession";

export default async function Page({ params }: { params: Promise<{ callId: string }> }) {
  const { callId } = await params;
  return (
    <Suspense>
      <CallSession callId={callId} />
    </Suspense>
  );
}
