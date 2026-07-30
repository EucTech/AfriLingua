"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Search, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface ConversationSummary {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerInitials: string;
  partnerLanguage: string;
  lastMessage: { text: string; createdAt: string; from: "me" | "them" } | null;
}

interface ChatMessageDto {
  id: string;
  from: "me" | "them";
  text: string;
  createdAt: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function ConversationListSkeleton() {
  return (
    <div className="space-y-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="bg-muted h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="bg-muted h-3 w-24 rounded" />
            <div className="bg-muted h-2.5 w-32 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesSkeleton() {
  return (
    <div className="space-y-3">
      {[
        { align: "items-start", width: "w-48" },
        { align: "items-end", width: "w-36" },
        { align: "items-start", width: "w-40" },
      ].map((row, i) => (
        <div key={i} className={cn("flex animate-pulse flex-col", row.align)}>
          <div className={cn("bg-muted h-9 rounded-xl", row.width)} />
        </div>
      ))}
    </div>
  );
}

function ConversationRow({
  conversation,
  active,
  onSelect,
}: {
  conversation: ConversationSummary;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        active ? "bg-primary/5" : "hover:bg-muted/50",
      )}
    >
      <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
        {conversation.partnerInitials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-foreground truncate text-sm font-semibold">{conversation.partnerName}</p>
          {conversation.lastMessage && (
            <span className="text-muted-foreground shrink-0 text-[11px]">
              {formatTime(conversation.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-muted-foreground truncate text-xs">
          {conversation.lastMessage?.text ?? "No messages yet"}
        </p>
      </div>
    </button>
  );
}

const conversationsKey = ["chat", "conversations"] as const;
const messagesKey = (conversationId: string) => ["chat", "conversations", conversationId, "messages"] as const;

export function ChatPage() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");

  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: conversationsKey,
    queryFn: () => api.get<ConversationSummary[]>("/chat/conversations"),
  });

  const resolvedActiveId = activeId ?? conversations[0]?.id ?? null;

  const { data: activeMessages = [], isLoading: loadingMessages } = useQuery({
    queryKey: messagesKey(resolvedActiveId ?? ""),
    queryFn: () => api.get<ChatMessageDto[]>(`/chat/conversations/${resolvedActiveId}/messages`),
    enabled: !!resolvedActiveId,
  });

  const activeConversation = conversations.find((c) => c.id === resolvedActiveId);
  const filteredConversations = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(search.toLowerCase()),
  );

  const selectConversation = (id: string) => {
    setActiveId(id);
    setMobileThreadOpen(true);
  };

  const sendMessageMutation = useMutation({
    mutationFn: (text: string) => api.post<ChatMessageDto>(`/chat/conversations/${resolvedActiveId}/messages`, { text }),
    onSuccess: (message) => {
      if (!resolvedActiveId) return;
      queryClient.setQueryData<ChatMessageDto[]>(messagesKey(resolvedActiveId), (prev) => [...(prev ?? []), message]);
      queryClient.setQueryData<ConversationSummary[]>(conversationsKey, (prev) =>
        prev?.map((c) =>
          c.id === resolvedActiveId
            ? { ...c, lastMessage: { text: message.text, createdAt: message.createdAt, from: "me" } }
            : c,
        ),
      );
    },
  });

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !resolvedActiveId) return;
    setDraft("");
    sendMessageMutation.mutate(text);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-11rem)] min-h-[520px] flex-col">
      <div className="mb-4 flex items-center gap-2">
        <MessageCircle className="text-primary" size={22} />
        <div>
          <h1 className="text-foreground text-xl font-semibold tracking-tight">Chats</h1>
          <p className="text-muted-foreground text-sm">Keep the conversation going with your partners.</p>
        </div>
      </div>

      <div className="bg-card border-border flex min-h-0 flex-1 overflow-hidden rounded-2xl border">
        <div
          className={cn(
            "border-border w-full flex-col md:flex md:w-72 md:shrink-0 md:border-r",
            mobileThreadOpen ? "hidden" : "flex",
          )}
        >
          <div className="border-border border-b p-3">
            <div className="relative">
              <Search
                size={15}
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                className="pl-9"
              />
            </div>
          </div>
          <div className="scrollbar flex-1 space-y-0.5 overflow-y-auto p-2">
            {loadingConversations && <ConversationListSkeleton />}
            {!loadingConversations &&
              filteredConversations.map((conversation) => (
                <ConversationRow
                  key={conversation.id}
                  conversation={conversation}
                  active={conversation.id === activeId}
                  onSelect={() => selectConversation(conversation.id)}
                />
              ))}
            {!loadingConversations && filteredConversations.length === 0 && (
              <p className="text-muted-foreground p-3 text-sm">No conversations yet.</p>
            )}
          </div>
        </div>

        <div
          className={cn(
            "min-w-0 flex-1 flex-col",
            mobileThreadOpen ? "flex" : "hidden md:flex",
          )}
        >
          {activeConversation ? (
            <>
              <div className="border-border flex items-center gap-3 border-b p-4">
                <button
                  onClick={() => setMobileThreadOpen(false)}
                  className="text-muted-foreground -ml-1 rounded-lg p-1 md:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} />
                </button>
                <div className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                  {activeConversation.partnerInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {activeConversation.partnerName}
                  </p>
                  <p className="text-muted-foreground text-xs">{activeConversation.partnerLanguage}</p>
                </div>
              </div>

              <div className="scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                {loadingMessages && <MessagesSkeleton />}
                {!loadingMessages &&
                  activeMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn("flex flex-col", message.from === "me" ? "items-end" : "items-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] rounded-xl px-3.5 py-2.5 text-sm",
                          message.from === "me"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-muted rounded-tl-sm",
                        )}
                      >
                        {message.text}
                      </div>
                      <span className="text-muted-foreground mt-1 text-[11px]">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="border-border flex items-end gap-2 border-t p-3">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="max-h-32 min-h-11 py-2.5"
                />
                <Button size="icon" onClick={sendMessage} disabled={!draft.trim()} aria-label="Send message">
                  <Send size={16} />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              {!loadingConversations && "Select a conversation to start chatting."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
