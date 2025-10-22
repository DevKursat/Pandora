export default function Loading() {
  return (
    <div className="min-h-screen animated-bg flex items-center justify-center">
      <div className="flex gap-1">
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <div className="w-3 h-3 rounded-full bg-primary animate-bounce" />
      </div>
    </div>
  )
}
