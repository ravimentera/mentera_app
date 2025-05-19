import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import appointmentsReducer from "./appointmentsSlice";
import approvalsReducer from "./approvalsSlice";
import dynamicLayoutReducer from "./dynamicLayoutSlice";
import globalStateReducer from "./globalStateSlice";
import messagesReducer from "./messagesSlice";
import { usersApi } from "./services/userApi";

export const store = configureStore({
  reducer: {
    [usersApi.reducerPath]: usersApi.reducer,
    messages: messagesReducer,
    dynamicLayout: dynamicLayoutReducer,
    globalState: globalStateReducer,
    appointments: appointmentsReducer,
    approvals: approvalsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(usersApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
