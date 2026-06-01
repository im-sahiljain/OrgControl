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
  
  // Default to authenticated Organization Admin for smooth initial loading
  isAuthenticated: true,
  user: {
    id: "user_admin_1",
    name: "Sahil",
    email: "admin@company.in",
    role: "org_admin",
    orgId: "org_default",
    department: "Human Resources",
    position: "CHRO (Head of HR)",
  },
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
    },
    logoutUser: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    setAuthRole: (state, action: PayloadAction<"platform_admin" | "org_admin" | "employee">) => {
      if (state.user) {
        state.user.role = action.payload;
        if (action.payload === "platform_admin") {
          state.user.name = "Platform Owner (SaaS Maker)";
          state.user.email = "owner@saasmaker.in";
          delete state.user.department;
          delete state.user.position;
        } else if (action.payload === "org_admin") {
          state.user.name = "Sahil";
          state.user.email = "admin@company.in";
          state.user.department = "Human Resources";
          state.user.position = "CHRO (Head of HR)";
        } else {
          state.user.name = "Aarav Sharma";
          state.user.email = "aarav.sharma@company.in";
          state.user.department = "Engineering";
          state.user.position = "Senior Software Engineer";
        }
      }
    },
    setAuthSession: (state, action: PayloadAction<UserSession>) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
  },
});

export const {
  setSelectedEmployee,
  closeDetailsModal,
  setSearchFilter,
  loginUser,
  logoutUser,
  setAuthRole,
  setAuthSession,
} = employeeUISlice.actions;

export const employeeUIReducer = employeeUISlice.reducer;
export default employeeUISlice.reducer;
