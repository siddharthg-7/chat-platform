// Placeholder data so the frontend renders fully before the Django Channels
// backend is connected. Replace with data returned from services/api.js and
// live messages from services/socketService.js.

export const mockConversations = [
  {
    id: 16,
    roomName: "room-16",
    contactName: "Jane Smith",
    contactEmail: "hi@bsbdb.com",
    lastMessage: "Hey!",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    unread: true,
    status: "open",
  },
  {
    id: 3,
    roomName: "room-3",
    contactName: "Example User",
    contactEmail: "user@example.com",
    lastMessage: "Looks like we have a bug with the export button...",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    unread: false,
    status: "open",
  },
  {
    id: 2,
    roomName: "room-2",
    contactName: "Example User",
    contactEmail: "user2@example.com",
    lastMessage: "Could you please take a look at unauthorized access...",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    unread: false,
    status: "open",
  },
  {
    id: 1,
    roomName: "room-1",
    contactName: "Example ProjectMap",
    contactEmail: "team@example.com",
    lastMessage: "Yes, I see it now. I've added m...",
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    unread: false,
    status: "open",
  },
];

export const mockMessagesByConversation = {
  16: [
    { id: "m1", from: "agent", author: "Jane Smith", text: "Quick reply sent", kind: "system", createdAt: daysAgo(1) },
    { id: "m2", from: "contact", author: "Jane Smith", text: "Ok", createdAt: daysAgo(1) },
    {
      id: "m3",
      from: "agent",
      author: "You",
      text: "I see you were asking about billing, correct?",
      createdAt: daysAgo(1),
    },
    { id: "m4", from: "contact", author: "Jane Smith", text: "Yes", tag: "CSV Import - 2024-06-01 12:00:1...", createdAt: daysAgo(1) },
    { id: "m5", from: "agent", author: "You", text: "Our billing support team will be with you soon!", createdAt: daysAgo(1) },
    { id: "m6", from: "contact", author: "Jane Smith", text: "Hey!", seen: true, createdAt: daysAgo(1) },
  ],
};

function daysAgo(n) {
  return new Date(Date.now() - 1000 * 60 * 60 * 24 * n).toISOString();
}
