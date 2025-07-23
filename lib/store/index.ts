import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import APIs
import {
  authApi,
  chartsApi,
  communicationsApi,
  patientsApi,
  transcriptionApi,
  usersApi,
} from "./api";

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
  transcriptionReducer,
  userRoleReducer,
} from "./slices";

export const store = configureStore({
  reducer: {
    // RTK Query APIs
    [authApi.reducerPath]: authApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [patientsApi.reducerPath]: patientsApi.reducer,
    [communicationsApi.reducerPath]: communicationsApi.reducer,
    [chartsApi.reducerPath]: chartsApi.reducer,
    [transcriptionApi.reducerPath]: transcriptionApi.reducer,

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
    transcription: transcriptionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      usersApi.middleware,
      patientsApi.middleware,
      communicationsApi.middleware,
      chartsApi.middleware,
      transcriptionApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
