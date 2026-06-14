const shimmer = {
  background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.5s infinite',
}

export default function OrderCardSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
      <div style={{ background: '#fff', border: '1px solid #E5E5E5', padding: '24px' }}>
        {/* top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ ...shimmer, height: 14, width: 110, marginBottom: 8 }} />
            <div style={{ ...shimmer, height: 11, width: 80 }} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ ...shimmer, height: 14, width: 60, marginBottom: 8 }} />
            <div style={{ ...shimmer, height: 16, width: 70, marginLeft: 'auto' }} />
          </div>
        </div>
        {/* images */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[0,1,2].map(i => <div key={i} style={{ ...shimmer, width: 64, height: 64 }} />)}
        </div>
        {/* bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ ...shimmer, height: 11, width: 60, marginBottom: 6 }} />
            <div style={{ ...shimmer, height: 11, width: 90 }} />
          </div>
          <div style={{ ...shimmer, height: 13, width: 80 }} />
        </div>
      </div>
    </>
  )
}
