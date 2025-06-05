import { format } from "date-fns";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  isOutbound: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const date = format(message.timestamp, "MMM dd, yyyy");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  return (
    <div className="flex flex-col space-y-8 p-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-4">
          <div className="flex justify-center">
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {date}
            </span>
          </div>
          {dateMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOutbound ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  message.isOutbound
                    ? "bg-[rgba(250,232,255,0.42)] rounded-tr-none"
                    : "bg-white border border-gray-200 rounded-tl-none"
                }`}
              >
                <p className="text-sm text-gray-900">{message.text}</p>
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">
                    {format(message.timestamp, "h:mm a")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
