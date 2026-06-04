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
}

export interface EmployeeUIState {
  selectedEmployee: Employee | null;
  isDetailsOpen: boolean;
  searchFilter: string;
  
  // Authentication parameters
  isAuthenticated: boolean;
  user: UserSession | null;
}

export const initialUIState: EmployeeUIState = {
  selectedEmployee: null,
  isDetailsOpen: false,
  searchFilter: "",
  
  // Default to unauthenticated — users must select a profile on the login page
  isAuthenticated: false,
  user: null,
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
      if (typeof window !== "undefined") {
        localStorage.removeItem("org_control_user");
      }
    },
    setAuthSession: (state, action: PayloadAction<UserSession>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("org_control_user", JSON.stringify(action.payload));
      }
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
} = employeeUISlice.actions;

export const employeeUIReducer = employeeUISlice.reducer;
export default employeeUISlice.reducer;
