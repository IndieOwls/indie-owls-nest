import { combineReducers } from '@reduxjs/toolkit'
import metaReducer from './meta'

export const rootReducer = combineReducers({
  meta: metaReducer,
})
