import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Loader2, LogOut } from 'lucide-react'
import { fetchProfile } from '../store/slices/profileSlice'
import { useAuth } from '../context/AuthContext'
import PersonalDetails from '../components/profile/PersonalDetails'
import SavedAddresses from '../components/profile/SavedAddresses'

function SkeletonBlock({ h = 20, w = '100%', style = {} }) {
  return (
    <div style={{
      height: h,
      width: w,
      background: 'linear-gradient(90deg, #141414 25%, #1C1C1C 50%, #141414 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      borderRadius: '8px',
      ...style,
    }} />
  )
}

function ProfileSkeleton() {
  return (
    <>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div className="bg-[#141414] border border-[#242424] rounded-2xl p-8">
        <SkeletonBlock h={14} w={140} style={{ marginBottom: '24px' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <SkeletonBlock h={10} w={80} style={{ marginBottom: '8px' }} />
              <SkeletonBlock h={18} />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#141414] border border-[#242424] rounded-2xl p-5 md:p-8 mt-6">
        <SkeletonBlock h={14} w={160} style={{ marginBottom: '24px' }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { loading, error } = useSelector((s) => s.profile)

  useEffect(() => {
    dispatch(fetchProfile())
  }, [dispatch])

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Page heading */}
        <div className="mb-10">
          <h1 className="font-serif text-3xl text-white mb-2 font-light">
            My Profile
          </h1>
          <p className="text-sm text-[#5C5C5C]">
            Manage your account details and saved addresses
          </p>
        </div>

        {loading && <ProfileSkeleton />}

        {!loading && error && (
          <div className="bg-[#141414] border border-[#242424] rounded-2xl p-5 md:p-8 md:p-12 text-center">
            <p className="text-[#E8A0B0] mb-4">{error}</p>
            <button
              onClick={() => dispatch(fetchProfile())}
              className="bg-gradient-to-r from-[#B8976A] to-[#A88345] text-white border-none px-6 py-3 cursor-pointer text-xs uppercase tracking-[0.1em] font-medium rounded-xl"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <PersonalDetails />
            <SavedAddresses />
            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 border border-[#E8A0B0]/30 text-[#E8A0B0] hover:bg-[#E8A0B0]/10 hover:border-[#E8A0B0] text-xs uppercase tracking-[0.1em] font-medium rounded-xl transition-all cursor-pointer w-full md:w-auto justify-center"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
