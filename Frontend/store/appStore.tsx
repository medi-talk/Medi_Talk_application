import React, { createContext, useContext, useReducer } from "react";

export type MedicationItem = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  expiry: string;
  times: string[];
  alarmFlag: boolean;
  familyShare: boolean;
};

export type TimerItem = {
  id: string;
  name: string;
  times: string[];
  nextRemainingSec: number;
};

export type DisposalItem = {
  id: string;
  name: string;
  expiry: string;
};

// User 타입 추가
export type User = {
  id: string;
  name: string;
} | null;

export type AppState = {
  user: User;
  medications: MedicationItem[];
  timers: TimerItem[];
  disposals: DisposalItem[];
};

type Action =
  | { type: "SET_USER"; payload: User }
  | { type: "CLEAR_USER" }
  | { type: "ADD_LINKED"; payload: MedicationItem }
  | { type: "UPDATE_LINKED"; payload: MedicationItem }
  | { type: "REMOVE_LINKED"; payload: string }
  | { type: "ADD_TIMER"; payload: TimerItem }
  | { type: "REMOVE_TIMER"; payload: string }
  | { type: "ADD_DISPOSAL"; payload: DisposalItem }
  | { type: "REMOVE_DISPOSAL"; payload: string };

const initialState: AppState = {
  user: null,
  medications: [],
  timers: [],
  disposals: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "CLEAR_USER":
      return { ...state, user: null };
    case "ADD_LINKED":
      return { ...state, medications: [...state.medications, action.payload] };
    case "UPDATE_LINKED":
      return {
        ...state,
        medications: state.medications.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload } : m
        ),
      };
    case "REMOVE_LINKED":
      return {
        ...state,
        medications: state.medications.filter((m) => m.id !== action.payload),
      };
    case "ADD_TIMER":
      return { ...state, timers: [...state.timers, action.payload] };
    case "REMOVE_TIMER":
      return { ...state, timers: state.timers.filter((t) => t.id !== action.payload) };
    case "ADD_DISPOSAL":
      return { ...state, disposals: [...state.disposals, action.payload] };
    case "REMOVE_DISPOSAL":
      return { ...state, disposals: state.disposals.filter((d) => d.id !== action.payload) };
    default:
      return state;
  }
}

const AppStoreContext = createContext<{
  state: AppState;
  setUser: (u: User) => void;
  clearUser: () => void;
  addLinked: (m: MedicationItem) => void;
  updateLinked: (m: MedicationItem) => void;
  removeLinked: (id: string) => void;
  addTimer: (t: TimerItem) => void;
  removeTimer: (id: string) => void;
  addDisposal: (d: DisposalItem) => void;
  removeDisposal: (id: string) => void;
}>({
  state: initialState,
  setUser: () => {},
  clearUser: () => {},
  addLinked: () => {},
  updateLinked: () => {},
  removeLinked: () => {},
  addTimer: () => {},
  removeTimer: () => {},
  addDisposal: () => {},
  removeDisposal: () => {},
});

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // 👇 user 관련 action
  const setUser = (u: User) => {
    dispatch({ type: "SET_USER", payload: u });
  };

  const clearUser = () => {
    dispatch({ type: "CLEAR_USER" });
  };

  const addLinked = (m: MedicationItem) => {
    dispatch({ type: "ADD_LINKED", payload: m });
  };

  const updateLinked = (m: MedicationItem) => {
    dispatch({ type: "UPDATE_LINKED", payload: m });
  };

  const removeLinked = (id: string) => {
    dispatch({ type: "REMOVE_LINKED", payload: id });
    dispatch({ type: "REMOVE_TIMER", payload: id });
    dispatch({ type: "REMOVE_DISPOSAL", payload: id });
  };

  const addTimer = (t: TimerItem) => {
    dispatch({ type: "ADD_TIMER", payload: t });
  };

  const removeTimer = (id: string) => {
    dispatch({ type: "REMOVE_TIMER", payload: id });
  };

  const addDisposal = (d: DisposalItem) => {
    dispatch({ type: "ADD_DISPOSAL", payload: d });
  };

  const removeDisposal = (id: string) => {
    dispatch({ type: "REMOVE_DISPOSAL", payload: id });
  };

  return (
    <AppStoreContext.Provider
      value={{
        state,
        setUser,
        clearUser,
        addLinked,
        updateLinked,
        removeLinked,
        addTimer,
        removeTimer,
        addDisposal,
        removeDisposal,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  return useContext(AppStoreContext);
}
