export default function ChatPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold">Chat {params.id}</h1>
      <p className="text-sm text-gray-600">This is a placeholder chat page.</p>
    </div>
  );
}
