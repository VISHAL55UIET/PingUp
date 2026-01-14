import { configureStore } from '@reduxjs/toolkit'
import  userReducer  from '../features/user/userSlice.js'
import  connectionssReducer  from '../features/connections/connectionsSlice.js'
import  messagesReducer  from '../features/messages/messagesSlice.js'


export const store = configureStore({
    reducer:{
        user:userReducer,
        connections:connectionssReducer,
        messages:messagesReducer
    }
})

