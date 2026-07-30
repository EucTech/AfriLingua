"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Mic, MicOff, Phone, PhoneOff, Send, Video, VideoOff } from "lucide-react";
import { Room, RoomEvent, Track, type RemoteTrack, type RemoteTrackPublication, type RemoteParticipant } from "livekit-client";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import type { CallMode } from "@/types/call";

async function withRetry(fn: () => Promise<unknown>, attempts = 2, delayMs = 800) {
  for (let i = 0; i < attempts; i++) {
    try {
      await fn();
      return;
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

interface CallPartner {
  id: string;
  name: string;
  initials: string;
  country: string;
}

interface CallDetails {
  id: string;
  mode: CallMode;
  startedAt: string;
  endedAt: string | null;
  token: string;
  livekitUrl: string;
  partner: CallPartner | null;
}

function formatElapsed(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function CallSession({ callId }: { callId: string }) {
  const [call, setCall] = useState<CallDetails | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [ended, setEnded] = useState(false);
  const [remoteConnected, setRemoteConnected] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ id: string; from: "me" | "them"; text: string }[]>([]);
  const [draft, setDraft] = useState("");

  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    api
      .get<CallDetails>(`/calls/${callId}`)
      .then(setCall)
      .catch((error) => {
        if (error instanceof ApiError) setNotFound(true);
        toast.error(error instanceof ApiError ? error.message : "Couldn't load this call.");
      });
  }, [callId]);

  useEffect(() => {
    if (ended || !call) return;
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [ended, call]);

  useEffect(() => {
    if (call?.mode === "chat" && call.partner) {
      const timeout = setTimeout(() => {
        setMessages([{ id: "greet", from: "them", text: "Hey! Ready to practice?" }]);
      }, 900);
      return () => clearTimeout(timeout);
    }
  }, [call]);

  useEffect(() => {
    if (!call || call.mode === "chat" || ended) return;

    let cancelled = false;
    const room = new Room();
    roomRef.current = room;

    const attachRemote = (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      void publication;
      void participant;
      if (track.kind === Track.Kind.Video && remoteVideoRef.current) {
        track.attach(remoteVideoRef.current);
        setRemoteConnected(true);
      } else if (track.kind === Track.Kind.Audio && remoteAudioRef.current) {
        track.attach(remoteAudioRef.current);
        setRemoteConnected(true);
      }
    };

    const detachRemote = (track: RemoteTrack) => {
      track.detach();
    };

    room.on(RoomEvent.TrackSubscribed, attachRemote);
    room.on(RoomEvent.TrackUnsubscribed, detachRemote);
    room.on(RoomEvent.ParticipantDisconnected, () => setRemoteConnected(false));

    (async () => {
      try {
        await room.connect(call.livekitUrl, call.token);
        if (cancelled) return;
        await withRetry(() => room.localParticipant.setMicrophoneEnabled(true));
        if (call.mode === "video") {
          await withRetry(() => room.localParticipant.setCameraEnabled(true));
          const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
          if (camPub?.track && localVideoRef.current) {
            camPub.track.attach(localVideoRef.current);
          }
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Couldn't connect to the call.";
          setConnectError(message);
          toast.error(message);
        }
      }
    })();

    return () => {
      cancelled = true;
      room.disconnect();
      roomRef.current = null;
    };
  }, [call, ended]);

  if (notFound) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">This call isn&apos;t available anymore.</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/matches">Back to tandem partners</Link>
        </Button>
      </div>
    );
  }

  if (!call || !call.partner) {
    return <p className="text-muted-foreground text-sm">Connecting…</p>;
  }

  const { partner, mode } = call;

  const toggleMic = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !micOn;
    setMicOn(next);
    try {
      await withRetry(() => room.localParticipant.setMicrophoneEnabled(next));
    } catch (error) {
      setMicOn(!next);
      toast.error(error instanceof Error ? error.message : "Couldn't update your microphone.");
    }
  };

  const toggleCamera = async () => {
    const room = roomRef.current;
    if (!room) return;
    const next = !cameraOn;
    setCameraOn(next);
    try {
      await withRetry(() => room.localParticipant.setCameraEnabled(next));
      if (next) {
        const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
        if (camPub?.track && localVideoRef.current) {
          camPub.track.attach(localVideoRef.current);
        }
      }
    } catch (error) {
      setCameraOn(!next);
      toast.error(error instanceof Error ? error.message : "Couldn't update your camera.");
    }
  };

  const endCall = () => {
    setEnded(true);
    roomRef.current?.disconnect();
    api.patch(`/calls/${callId}/end`).catch(() => toast.error("Couldn't properly end the call."));
  };

  if (ended) {
    return (
      <div className="mx-auto max-w-sm space-y-5 py-16 text-center">
        <div className="bg-muted text-muted-foreground mx-auto flex h-14 w-14 items-center justify-center rounded-full">
          <PhoneOff size={24} />
        </div>
        <div>
          <h1 className="text-foreground text-lg font-semibold tracking-tight">Call ended</h1>
          <p className="text-muted-foreground text-sm">
            You practiced with {partner.name} for {formatElapsed(elapsed)}.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/matches">Back to tandem partners</Link>
        </Button>
      </div>
    );
  }

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), from: "me", text }]);
    setDraft("");
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-11rem)] min-h-[480px] max-w-2xl flex-col">
      <div className="border-border flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white">
            {partner.initials}
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold">{partner.name}</p>
            <p className="text-muted-foreground text-xs">{partner.country}</p>
          </div>
        </div>
        <span className="text-muted-foreground text-xs tabular-nums">{formatElapsed(elapsed)}</span>
      </div>

      {mode === "chat" ? (
        <>
          <div className="scrollbar flex-1 space-y-3 overflow-y-auto py-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.from === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm ${
                    message.from === "me"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="border-border flex items-center gap-2 border-t pt-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="bg-input/50 h-11 flex-1 rounded-full border border-transparent px-4 text-sm outline-none focus-visible:border-ring"
            />
            <Button size="icon" onClick={sendMessage} disabled={!draft.trim()} aria-label="Send message">
              <Send size={16} />
            </Button>
            <Button size="icon" variant="destructive" onClick={endCall} aria-label="End call">
              <PhoneOff size={16} />
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="bg-muted/50 relative my-4 flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl">
            {mode === "video" && (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={`h-full w-full object-cover ${remoteConnected ? "" : "hidden"}`}
              />
            )}
            <audio ref={remoteAudioRef} autoPlay />

            {!remoteConnected && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <span className="bg-primary/20 absolute inset-0 animate-ping rounded-full" />
                  <div className="bg-primary relative flex h-24 w-24 items-center justify-center rounded-full text-2xl font-semibold text-white">
                    {partner.initials}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-foreground text-base font-semibold">{partner.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {connectError ?? `Waiting for ${partner.name} to join…`}
                  </p>
                </div>
              </div>
            )}

            {mode === "video" && (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute right-3 bottom-3 h-24 w-32 rounded-lg object-cover shadow-lg"
              />
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pb-2">
            <button
              onClick={() => void toggleMic()}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                micOn ? "bg-muted text-foreground hover:bg-muted/70" : "bg-destructive/10 text-destructive"
              }`}
              aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            {mode === "video" && (
              <button
                onClick={() => void toggleCamera()}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  cameraOn ? "bg-muted text-foreground hover:bg-muted/70" : "bg-destructive/10 text-destructive"
                }`}
                aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
              >
                {cameraOn ? <Video size={18} /> : <VideoOff size={18} />}
              </button>
            )}

            <button
              onClick={endCall}
              className="bg-destructive flex h-12 w-12 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90"
              aria-label="End call"
            >
              <Phone size={18} className="rotate-[135deg]" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
