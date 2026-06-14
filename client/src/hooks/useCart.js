import { useDispatch, useSelector } from 'react-redux'
import {
  addToCart, removeFromCart, updateQty, applyCoupon, removeCoupon, clearCart,
  selectCartItems, selectCartTotal, selectCartCount, selectDiscountedTotal, selectCoupon,
} from '../store/slices/cartSlice'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_CHARGE } from '../utils/constants'

export const useCart = () => {
  const dispatch = useDispatch()
  const items = useSelector(selectCartItems)
  const total = useSelector(selectCartTotal)
  const count = useSelector(selectCartCount)
  const discountedTotal = useSelector(selectDiscountedTotal)
  const coupon = useSelector(selectCoupon)

  const shipping = discountedTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE
  const finalTotal = discountedTotal + shipping

  return {
    items,
    total,
    count,
    discountedTotal,
    coupon,
    shipping,
    finalTotal,
    addToCart: (item) => dispatch(addToCart(item)),
    removeFromCart: (item) => dispatch(removeFromCart(item)),
    updateQty: (item) => dispatch(updateQty(item)),
    applyCoupon: (payload) => dispatch(applyCoupon(payload)),
    removeCoupon: () => dispatch(removeCoupon()),
    clearCart: () => dispatch(clearCart()),
  }
}
