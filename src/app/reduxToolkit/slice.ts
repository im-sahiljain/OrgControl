import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Employee {
  id: string;
  _id?: string;
  empName: string;
  empAge: string | number;
  empPosition: string;
  email?: string;
  profilePhoto?: string;
  department?: string;
  status?: string;
  salary?: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "platform_admin" | "org_admin" | "employee";
  orgId: string;
  department?: string;
  position?: string;
  isSandbox?: boolean;
}

export interface CandidateQueueItem {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  jobId: string;
  resumeUrl?: string;
  resumeText?: string;
  stage?: string;
}

export interface EmployeeUIState {
  selectedEmployee: Employee | null;
  isDetailsOpen: boolean;
  searchFilter: string;
  isSidebarCollapsed: boolean;
  
  // Authentication parameters
  isAuthenticated: boolean;
  user: UserSession | null;

  // Global AI Batch Screening Queue state
  isBatchScreening: boolean;
  batchQueue: CandidateQueueItem[];
  batchTotal: number;
  batchProgress: number;
  batchCurrentName: string;
  batchJobId: string | null;
  cancelRequested: boolean;
}

export const initialUIState: EmployeeUIState = {
  selectedEmployee: null,
  isDetailsOpen: false,
  searchFilter: "",
  isSidebarCollapsed: false,
  
  // Default to unauthenticated — users session hydrates on client mount
  isAuthenticated: false,
  user: null,

  // AI Screening Defaults
  isBatchScreening: false,
  batchQueue: [],
  batchTotal: 0,
  batchProgress: 0,
  batchCurrentName: "",
  batchJobId: null,
  cancelRequested: false,
};

export const employeeUISlice = createSlice({
  name: "employeeUI",
  initialState: initialUIState,
  reducers: {
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
      state.isDetailsOpen = action.payload !== null;
    },
    closeDetailsModal: (state) => {
      state.selectedEmployee = null;
      state.isDetailsOpen = false;
    },
    setSearchFilter: (state, action: PayloadAction<string>) => {
      state.searchFilter = action.payload;
    },
    
    // Auth actions
    loginUser: (state, action: PayloadAction<UserSession>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("org_control_user", JSON.stringify(action.payload));
      }
    },
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.isBatchScreening = false;
      state.batchQueue = [];
      state.batchCurrentName = "";
      state.batchJobId = null;
      state.cancelRequested = true;
      if (typeof window !== "undefined") {
        localStorage.removeItem("org_control_user");
        localStorage.removeItem("org_control_screening_state");
      }
    },
    setAuthSession: (state, action: PayloadAction<UserSession>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("org_control_user", JSON.stringify(action.payload));
      }
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar_collapsed", String(state.isSidebarCollapsed));
      }
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar_collapsed", String(action.payload));
      }
    },

    // Global AI Screening Actions
    startGlobalScreening: (
      state,
      action: PayloadAction<{
        candidates: CandidateQueueItem[];
        jobId: string | null;
        total?: number;
        initialProgress?: number;
      }>
    ) => {
      state.isBatchScreening = true;
      state.batchQueue = action.payload.candidates;
      state.batchTotal =
        action.payload.total !== undefined
          ? action.payload.total
          : action.payload.candidates.length;
      state.batchProgress =
        action.payload.initialProgress !== undefined
          ? action.payload.initialProgress
          : 0;
      state.batchCurrentName = action.payload.candidates[0]?.name || "";
      state.batchJobId = action.payload.jobId;
      state.cancelRequested = false;
    },
    updateGlobalScreeningProgress: (
      state,
      action: PayloadAction<{ progress: number; currentName: string }>
    ) => {
      state.batchProgress = action.payload.progress;
      state.batchCurrentName = action.payload.currentName;
    },
    setSyncedScreeningState: (
      state,
      action: PayloadAction<{
        isBatchScreening: boolean;
        batchTotal: number;
        batchProgress: number;
        batchCurrentName: string;
        batchJobId: string | null;
      }>
    ) => {
      state.isBatchScreening = action.payload.isBatchScreening;
      state.batchTotal = action.payload.batchTotal;
      state.batchProgress = action.payload.batchProgress;
      state.batchCurrentName = action.payload.batchCurrentName;
      state.batchJobId = action.payload.batchJobId;
      if (!action.payload.isBatchScreening) {
        state.batchQueue = [];
      }
    },
    requestCancelGlobalScreening: (state) => {
      state.cancelRequested = true;
    },
    stopOrFinishGlobalScreening: (state) => {
      state.isBatchScreening = false;
      state.batchQueue = [];
      state.batchCurrentName = "";
      state.cancelRequested = false;
    },
  },
});

export const {
  setSelectedEmployee,
  closeDetailsModal,
  setSearchFilter,
  loginUser,
  logoutUser,
  setAuthSession,
  toggleSidebar,
  setSidebarCollapsed,
  startGlobalScreening,
  updateGlobalScreeningProgress,
  setSyncedScreeningState,
  requestCancelGlobalScreening,
  stopOrFinishGlobalScreening,
} = employeeUISlice.actions;

export const employeeUIReducer = employeeUISlice.reducer;
export default employeeUISlice.reducer;

