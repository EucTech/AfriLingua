"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { incomingRequests as initialIncomingRequests, partners } from "@/features/matching/data/partners";
import { useMatchRequests } from "@/features/matching/store/useMatchRequests";
import type { IncomingMatchRequest, TandemPartner } from "@/types/match";

const ALL = "all";

function PartnerCard({ partner }: { partner: TandemPartner }) {
  const status = useMatchRequests((state) => state.statusFor(partner.id));
  const send = useMatchRequests((state) => state.send);

  return (
    <div className="bg-card border-border flex flex-col gap-4 rounded-xl border p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
          {partner.initials}
        </div>
        <div>
          <p className="text-foreground text-sm font-semibold">{partner.name}</p>
          <p className="text-muted-foreground text-xs">{partner.country}</p>
        </div>
      </div>

      <div className="text-muted-foreground space-y-1 text-xs">
        <p>
          <span className="text-foreground font-medium">Speaks:</span> {partner.speaks.join(", ")}
        </p>
        <p>
          <span className="text-foreground font-medium">Learning:</span> {partner.learning.join(", ")}
        </p>
        <p className="capitalize">
          <span className="text-foreground font-medium">Level:</span> {partner.proficiency}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {partner.availability.map((slot) => (
          <span
            key={slot}
            className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium"
          >
            {slot}
          </span>
        ))}
      </div>

      <Button
        size="sm"
        variant={status === "none" ? "default" : "secondary"}
        disabled={status !== "none"}
        onClick={() => {
          send(partner.id);
          toast.success(`Request sent to ${partner.name}`);
        }}
        className="mt-auto"
      >
        {status === "pending" ? "Request sent" : status === "accepted" ? "Connected" : "Send request"}
      </Button>
    </div>
  );
}

function IncomingRequestRow({
  request,
  onAccept,
  onDecline,
}: {
  request: IncomingMatchRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  return (
    <div className="bg-card border-border flex items-start gap-3 rounded-xl border p-4">
      <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
        {request.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-medium">
          {request.name} <span className="text-muted-foreground font-normal">· {request.country}</span>
        </p>
        <p className="text-muted-foreground text-xs">{request.message}</p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        <Button size="icon-sm" variant="outline" onClick={onAccept} aria-label="Accept">
          <Check size={14} />
        </Button>
        <Button size="icon-sm" variant="outline" onClick={onDecline} aria-label="Decline">
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}

export function MatchingPage() {
  const [country, setCountry] = useState(ALL);
  const [language, setLanguage] = useState(ALL);
  const [proficiency, setProficiency] = useState(ALL);
  const [incoming, setIncoming] = useState(initialIncomingRequests);

  const countries = useMemo(() => Array.from(new Set(partners.map((p) => p.country))), []);
  const languages = useMemo(
    () => Array.from(new Set(partners.flatMap((p) => p.speaks))),
    [],
  );

  const filtered = partners.filter((partner) => {
    if (country !== ALL && partner.country !== country) return false;
    if (language !== ALL && !partner.speaks.includes(language)) return false;
    if (proficiency !== ALL && partner.proficiency !== proficiency) return false;
    return true;
  });

  const respond = (id: string, accepted: boolean) => {
    const request = incoming.find((item) => item.id === id);
    setIncoming((prev) => prev.filter((item) => item.id !== id));
    if (request) {
      toast.success(accepted ? `You're now connected with ${request.name}` : `Declined ${request.name}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Users className="text-primary" size={22} />
        <div>
          <h1 className="text-foreground text-xl font-semibold tracking-tight">Tandem partners</h1>
          <p className="text-muted-foreground text-sm">
            Find a language exchange partner who speaks what you&apos;re learning.
          </p>
        </div>
      </div>

      {incoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-foreground text-sm font-semibold">Incoming requests</h2>
          <div className="space-y-2">
            {incoming.map((request) => (
              <IncomingRequestRow
                key={request.id}
                request={request}
                onAccept={() => respond(request.id, true)}
                onDecline={() => respond(request.id, false)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Country" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All countries</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Speaks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any language</SelectItem>
            {languages.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={proficiency} onValueChange={setProficiency}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Any level</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3",
          filtered.length === 0 && "hidden",
        )}
      >
        {filtered.map((partner) => (
          <PartnerCard key={partner.id} partner={partner} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-sm">No partners match those filters yet.</p>
      )}
    </div>
  );
}
