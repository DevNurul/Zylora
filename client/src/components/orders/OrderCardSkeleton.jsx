const shimmer = {
  background: 'linear-gradient(90deg,#1C1C1C 25%,#242424 50%,#1C1C1C 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
}

export default function OrderCardSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div className="bg-[#141414] border border-[#242424] p-6 rounded-lg">
        <div className="flex justify-between mb-4">
          <div>
            <div style={{ ...shimmer, height: 14, width: 110, marginBottom: 8, borderRadius: 4 }} />
            <div style={{ ...shimmer, height: 11, width: 80, borderRadius: 4 }} />
          </div>
          <div className="text-right">
            <div style={{ ...shimmer, height: 14, width: 60, marginBottom: 8, borderRadius: 4 }} />
            <div style={{ ...shimmer, height: 16, width: 70, marginLeft: 'auto', borderRadius: 4 }} />
          </div>
        </div>
        <div className="flex gap-2 mb-4">
          {[0,1,2].map(i => <div key={i} style={{ ...shimmer, width: 64, height: 64, borderRadius: 4 }} />)}
        </div>
        <div className="flex justify-between">
          <div>
            <div style={{ ...shimmer, height: 11, width: 60, marginBottom: 6, borderRadius: 4 }} />
            <div style={{ ...shimmer, height: 11, width: 90, borderRadius: 4 }} />
          </div>
          <div style={{ ...shimmer, height: 13, width: 80, borderRadius: 4 }} />
        </div>
      </div>
    </>
  )
}
