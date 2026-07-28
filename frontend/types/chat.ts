export interface ChatMessage {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
}

export interface Conversation {
  id: string;
  partnerName: string;
  partnerInitials: string;
  partnerLanguage: string;
  online: boolean;
  messages: ChatMessage[];
}
