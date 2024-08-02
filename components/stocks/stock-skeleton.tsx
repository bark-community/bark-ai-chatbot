export const StockSkeleton = () => {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-green-400">
      {/* Status Placeholder */}
      <div className="float-right inline-block w-fit rounded-full bg-zinc-700 px-2 py-1 text-xs text-transparent">
        xxxxxxx
      </div>
      
      {/* Symbol Placeholder */}
      <div className="mb-1 w-fit rounded-md bg-zinc-700 text-lg text-transparent">
        xxxx
      </div>
      
      {/* Price Placeholder */}
      <div className="w-fit rounded-md bg-zinc-700 text-3xl font-bold text-transparent">
        xxxx
      </div>
      
      {/* Additional Details Placeholder */}
      <div className="mt-1 w-fit rounded-md bg-zinc-700 text-xs text-transparent">
        xxxxxx xxx xx xxxx xx xxx
      </div>
      
      {/* Slider/Action Placeholder */}
      <div className="relative -mx-4 cursor-col-resize">
        <div style={{ height: '146px' }}></div>
      </div>
    </div>
  )
}
