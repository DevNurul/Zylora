import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  toggleItem,
  removeItem,
  serverToggleWishlist,
  selectWishlistItems,
  selectWishlistCount,
  selectWishlistLoading,
} from '../store/slices/wishlistSlice'
import { useAuth } from '../context/AuthContext'

export const useWishlist = () => {
  const dispatch            = useDispatch()
  const items               = useSelector(selectWishlistItems)
  const count               = useSelector(selectWishlistCount)
  const loading             = useSelector(selectWishlistLoading)
  const { isAuthenticated } = useAuth()

  const isLiked = useCallback(
    (productId) => items.some((i) => (i.id || i._id) === productId),
    [items]
  )

  /*
    toggle — optimistic update first, then syncs to the server.
    If server call fails the optimistic update is rolled back and a toast is shown.
  */
  const toggle = useCallback(
    (product) => {
      const id    = product.id || product._id
      const liked = items.some((i) => (i.id || i._id) === id)

      // Instant UI update
      dispatch(toggleItem(product))

      if (isAuthenticated) {
        dispatch(serverToggleWishlist({ productId: id, isLiked: liked }))
          .unwrap()
          .catch(() => {
            // Roll back the optimistic update
            dispatch(toggleItem(product))
            toast.error(liked ? 'Failed to remove from wishlist' : 'Failed to add to wishlist')
          })
      }
    },
    [dispatch, isAuthenticated, items]
  )

  /*
    remove — used on the Likes page where we know the item is already liked.
  */
  const remove = useCallback(
    (productId) => {
      dispatch(removeItem(productId))

      if (isAuthenticated) {
        dispatch(serverToggleWishlist({ productId, isLiked: true }))
          .unwrap()
          .catch(() => {
            toast.error('Failed to remove from wishlist')
          })
      }
    },
    [dispatch, isAuthenticated]
  )

  return { items, count, loading, isLiked, toggle, remove }
}
