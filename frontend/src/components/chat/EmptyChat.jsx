import React from "react";
import { MessageCircleMore } from "lucide-react";

const EmptyChat = () => {
  return (
    <div className="flex flex-1 items-center justify-center bg-wa-bg">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-wa-panel">
          <MessageCircleMore
            className="h-12 w-12 text-wa-teal"
          />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-wa-text">
          Welcome to Chat Platform
        </h2>
        <p className="text-sm leading-7 text-wa-text-muted">
          Select a conversation from the sidebar to start messaging.
        </p>
      </div>
    </div>
  );
};

export default EmptyChat;