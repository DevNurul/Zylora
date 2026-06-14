import { configureStore } from '@reduxjs/toolkit'
import cartReducer     from './slices/cartSlice'
import productReducer  from './slices/productSlice'
import orderReducer    from './slices/orderSlice'
import uiReducer       from './slices/uiSlice'
import wishlistReducer from './slices/wishlistSlice'
import profileReducer  from './slices/profileSlice'
import myOrdersReducer from './slices/myOrdersSlice'
import returnReducer   from './slices/returnSlice'
import walletReducer   from './slices/walletSlice'

export const store = configureStore({
  reducer: {
    cart:     cartReducer,
    product:  productReducer,
    order:    orderReducer,
    ui:       uiReducer,
    wishlist: wishlistReducer,
    profile:  profileReducer,
    myOrders: myOrdersReducer,
    returns:  returnReducer,
    wallet:   walletReducer,
  },
})
