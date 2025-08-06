import { PatientStatusFilter } from "@/app/constants/patient-constants";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { Patient, PatientsState } from "../types";

const initialState: PatientsState = {
  selectedPatient: null,
  searchQuery: "",
  filters: {
    status: PatientStatusFilter.ALL,
  },
  viewMode: "table",
  loading: false,
  error: null,
};

export const patientsSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {
    setSelectedPatient: (state, action: PayloadAction<Patient | null>) => {
      state.selectedPatient = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<PatientsState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { status: PatientStatusFilter.ALL };
      state.searchQuery = "";
    },
    setViewMode: (state, action: PayloadAction<"table" | "grid">) => {
      state.viewMode = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSelectedPatient,
  setSearchQuery,
  setFilters,
  clearFilters,
  setViewMode,
  setLoading,
  setError,
  clearError,
} = patientsSlice.actions;

// Selectors
export const selectSelectedPatient = (state: RootState) => state.patients.selectedPatient;
export const selectSearchQuery = (state: RootState) => state.patients.searchQuery;
export const selectFilters = (state: RootState) => state.patients.filters;
export const selectViewMode = (state: RootState) => state.patients.viewMode;
export const selectPatientsLoading = (state: RootState) => state.patients.loading;
export const selectPatientsError = (state: RootState) => state.patients.error;

export default patientsSlice.reducer;
