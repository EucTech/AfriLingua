"use client";

import { useState } from "react";
import { ArrowLeft, MessageCircle, Search, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { conversations as initialConversations } from "@/features/chat/data/conversations";
import type { Conversation } from "@/types/chat";

function formatNow() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function ConversationRow({
  conversation,
  active,
  onSelect,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
}) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
        active ? "bg-primary/5" : "hover:bg-muted/50",
      )}
    >
      <div className="relative shrink-0">
        <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-full text-xs font-semibold text-white">
          {conversation.partnerInitials}
        </div>
        {conversation.online && (
          <span className="border-card absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full border-2 bg-success" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-foreground truncate text-sm font-semibold">{conversation.partnerName}</p>
          <span className="text-muted-foreground shrink-0 text-[11px]">{lastMessage?.time}</span>
        </div>
        <p className="text-muted-foreground truncate text-xs">{lastMessage?.text}</p>
      </div>
    </button>
  );
}

export function ChatPage() {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id ?? "");
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");

  const activeConversation = conversations.find((c) => c.id === activeId);
  const filteredConversations = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(search.toLowerCase()),
  );

  const selectConversation = (id: string) => {
    setActiveId(id);
    setMobileThreadOpen(true);
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !activeConversation) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, messages: [...c.messages, { id: crypto.randomUUID(), from: "me", text, time: formatNow() }] }
          : c,
      ),
    );
    setDraft("");
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
            {filteredConversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === activeId}
                onSelect={() => selectConversation(conversation.id)}
              />
            ))}
            {filteredConversations.length === 0 && (
              <p className="text-muted-foreground p-3 text-sm">No conversations match your search.</p>
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
                  <p className="text-muted-foreground text-xs">
                    {activeConversation.partnerLanguage} ·{" "}
                    {activeConversation.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="scrollbar flex-1 space-y-3 overflow-y-auto p-4">
                {activeConversation.messages.map((message) => (
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
                    <span className="text-muted-foreground mt-1 text-[11px]">{message.time}</span>
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
              Select a conversation to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
