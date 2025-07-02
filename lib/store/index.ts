import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import APIs
import { authApi, patientsApi, usersApi } from "./api";

// Import slices
import {
  appointmentsReducer,
  approvalsReducer,
  authReducer,
  dynamicLayoutReducer,
  fileUploadsReducer,
  globalStateReducer,
  messagesReducer,
  patientsReducer,
  threadsReducer,
  userRoleReducer,
} from "./slices";

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [patientsApi.reducerPath]: patientsApi.reducer,

    // Regular slices
    auth: authReducer,
    messages: messagesReducer,
    dynamicLayout: dynamicLayoutReducer,
    globalState: globalStateReducer,
    appointments: appointmentsReducer,
    approvals: approvalsReducer,
    userRole: userRoleReducer,
    patients: patientsReducer,
    fileUploads: fileUploadsReducer,
    threads: threadsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, usersApi.middleware, patientsApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
