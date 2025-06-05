export default function ChatMessageSkeleton() {
  return (
    <div className="w-full flex items-start">
      <div className="bg-gray-100 px-4 py-3 rounded-xl max-w-[85%] w-full animate-pulse space-y-2">
        <div className="h-3 w-3/4 bg-gray-300 rounded" />
        <div className="h-3 w-5/6 bg-gray-300 rounded" />
        <div className="h-3 w-2/3 bg-gray-300 rounded" />
        <div className="h-3 w-1/2 bg-gray-300 rounded" />
      </div>
    </div>
  );
}
