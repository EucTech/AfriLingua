import type { Conversation } from "@/types/chat";

export const conversations: Conversation[] = [
  {
    id: "c1",
    partnerName: "Amara Diallo",
    partnerInitials: "AD",
    partnerLanguage: "Yoruba",
    online: true,
    messages: [
      { id: "m1", from: "them", text: "Ẹ káàrọ̀! Ready for today's session?", time: "9:02 AM" },
      { id: "m2", from: "me", text: "Good morning! Yes, let's go over greetings again", time: "9:04 AM" },
      { id: "m3", from: "them", text: "Great, so \"Ẹ káàrọ̀\" is good morning. Try it back?", time: "9:05 AM" },
    ],
  },
  {
    id: "c2",
    partnerName: "Kwame Mensah",
    partnerInitials: "KM",
    partnerLanguage: "Hausa",
    online: false,
    messages: [
      { id: "m1", from: "them", text: "Sannu! How did the homework go?", time: "Yesterday" },
      { id: "m2", from: "me", text: "Sannu! Still working through the numbers 1-20", time: "Yesterday" },
    ],
  },
  {
    id: "c3",
    partnerName: "Naledi Khumalo",
    partnerInitials: "NK",
    partnerLanguage: "Zulu",
    online: true,
    messages: [
      { id: "m1", from: "them", text: "Sawubona! Free for a quick call later?", time: "Monday" },
      { id: "m2", from: "me", text: "Sawubona! Yes, after 6pm works for me", time: "Monday" },
      { id: "m3", from: "them", text: "Perfect, I'll ping you then 🎉", time: "Monday" },
    ],
  },
  {
    id: "c4",
    partnerName: "Amina Yusuf",
    partnerInitials: "AY",
    partnerLanguage: "Swahili",
    online: false,
    messages: [
      { id: "m1", from: "them", text: "Habari! Thanks for accepting my request", time: "Last week" },
      { id: "m2", from: "me", text: "Habari yako! Excited to practice together", time: "Last week" },
    ],
  },
];
