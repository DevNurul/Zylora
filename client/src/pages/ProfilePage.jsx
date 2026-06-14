import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'
import { fetchProfile } from '../store/slices/profileSlice'
import PersonalDetails from '../components/profile/PersonalDetails'
import SavedAddresses from '../components/profile/SavedAddresses'

function SkeletonBlock({ h = 20, w = '100%', style = {} }) {
  return (
    <div style={{
      height: h,
      width: w,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  )
}

function ProfileSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ background: '#fff', padding: '32px' }}>
        <SkeletonBlock h={14} w={140} style={{ marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <SkeletonBlock h={10} w={80} style={{ marginBottom: '8px' }} />
              <SkeletonBlock h={18} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: '#fff', padding: '32px', marginTop: '24px' }}>
        <SkeletonBlock h={14} w={160} style={{ marginBottom: '24px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[...Array(2)].map((_, i) => (
            <SkeletonBlock key={i} h={140} />
          ))}
        </div>
      </div>
    </>
  )
}

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((s) => s.profile)

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  return (
    <div style={{ minHeight: '100vh', background: '#FCD4DB', padding: '48px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Page heading */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: '32px',
            color: '#0A0A0A',
            margin: '0 0 8px',
            fontWeight: 400,
          }}>
            My Profile
          </h1>
          <p style={{ fontSize: '14px', color: '#6B6B6B', margin: 0 }}>
            Manage your account details and saved addresses
          </p>
        </div>

        {loading && <ProfileSkeleton />}

        {!loading && error && (
          <div style={{ background: '#fff', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</p>
            <button
              onClick={() => dispatch(fetchProfile())}
              style={{ background: '#EE6B83', color: '#fff', border: 'none', padding: '10px 24px', cursor: 'pointer', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', borderRadius: 8 }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <PersonalDetails />
            <SavedAddresses />
          </>
        )}
      </div>
    </div>
  )
}
