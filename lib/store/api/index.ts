// Export all API endpoints and hooks

// Users API
export {
  useGetUserByIdQuery,
  useGetUsersQuery,
  usersApi,
} from "./usersApi";

// Patients API
export {
  // useGetPatientByIdQuery,
  // useCreatePatientMutation,
  // useUpdatePatientMutation,
  // useDeletePatientMutation,
  patientsApi,
  useGetPatientsByProviderQuery,
} from "./patientsApi";

// Auth API
export {
  authApi,
  useGenerateTokenQuery,
  useLazyGenerateTokenQuery,
  useLoginMutation,
  useLogoutMutation,
} from "./authApi";

// Future APIs
// export { appointmentsApi } from './appointmentsApi';
// export { treatmentsApi } from './treatmentsApi';
