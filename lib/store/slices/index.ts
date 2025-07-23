// Patients slice
export {
  clearError,
  clearFilters,
  default as patientsReducer,
  selectFilters,
  selectPatientsError,
  selectPatientsLoading,
  selectSearchQuery,
  selectSelectedPatient,
  selectViewMode,
  setError,
  setFilters,
  setLoading,
  setSearchQuery,
  setSelectedPatient,
  setViewMode,
} from "./patientsSlice";

// Transcription slice
export * from "./transcriptionSlice";
export { transcriptionReducer } from "./transcriptionSlice";

// Other slices (existing ones)
export { default as appointmentsReducer } from "./appointmentsSlice";
export { default as approvalsReducer } from "./approvalsSlice";
export { default as authReducer } from "./authSlice";
export { default as dynamicLayoutReducer } from "./dynamicLayoutSlice";
export { default as fileUploadsReducer } from "./fileUploadsSlice";
export { default as globalStateReducer } from "./globalStateSlice";
export { default as messagesReducer } from "./messagesSlice";
export { default as threadsReducer } from "./threadsSlice";
export { default as userRoleReducer } from "./userRoleSlice";
