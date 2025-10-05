// appStore.ts
import React, { createContext, useContext, useReducer } from "react";

export type MedicationItem = {
  id: string;
  name: string;
  type?: string;
  startDate: string;
  endDate: string;
  expiry: string;
  times: string[];
  intervalMinutes?: number;
  alarmFlag: boolean;
  familyShare: boolean;
  countMode: "auto" | "manual";
  nightSilent: boolean;
};

export type TimerItem = {
  id: string;
  name: string;
  times?: string[];
  totalSec: number;
  baseTime: number;
  isRunning: boolean;
  pauseOffset: number;
};

export type DisposalItem = {
  id: string;
  name: string;
  expiry: string;
};

export type IntakeItem = {
  id: string;
  name: string;
  dose: string;
};

export type User = {
  id: string;
  name: string;
} | null;

export type AppState = {
  user: User;
  medications: MedicationItem[];
  timers: TimerItem[];
  disposals: DisposalItem[];
  intakes: IntakeItem[];
};

type Action =
  | { type: "SET_USER"; payload: User }
  | { type: "CLEAR_USER" }
  | { type: "ADD_LINKED"; payload: MedicationItem }
  | { type: "UPDATE_LINKED"; payload: MedicationItem }
  | { type: "REMOVE_LINKED"; payload: string }
  | { type: "ADD_TIMER"; payload: TimerItem }
  | { type: "UPDATE_TIMER"; payload: TimerItem }
  | { type: "REMOVE_TIMER"; payload: string }
  | { type: "ADD_DISPOSAL"; payload: DisposalItem }
  | { type: "REMOVE_DISPOSAL"; payload: string }
  | { type: "ADD_INTAKE"; payload: IntakeItem }
  | { type: "UPDATE_INTAKE"; payload: IntakeItem }
  | { type: "REMOVE_INTAKE"; payload: string };

const initialState: AppState = {
  user: null,
  medications: [],
  timers: [],
  disposals: [],
  intakes: [],
};

const safeNumber = (v: any, fallback: number) =>
  typeof v === "number" && isFinite(v) ? v : fallback;

const clampMin = (n: number, min: number) => (n < min ? min : n);

const sanitizeTimes = (arr: any): string[] =>
  Array.isArray(arr) ? arr.filter((t) => t && String(t).trim() !== "") : [];

const buildTimer = (
  prev: TimerItem | undefined,
  patch: Partial<TimerItem> & { id: string; name?: string }
): TimerItem => {
  const prevObj = prev ?? ({} as TimerItem);
  const name = (patch.name ?? prevObj.name ?? "").toString();
  const times = sanitizeTimes(patch.times ?? prevObj.times ?? []);

  let totalSec = safeNumber(patch.totalSec ?? prevObj.totalSec ?? 60, 60);
  totalSec = clampMin(totalSec, 60);

  const baseTime = safeNumber(
    patch.baseTime ?? prevObj.baseTime ?? Date.now(),
    Date.now()
  );

  let pauseOffset = safeNumber(patch.pauseOffset ?? prevObj.pauseOffset ?? 0, 0);
  pauseOffset = clampMin(pauseOffset, 0);

  const isRunning = Boolean(patch.isRunning ?? prevObj.isRunning ?? false);

  return {
    id: patch.id,
    name,
    times,
    totalSec,
    baseTime,
    isRunning,
    pauseOffset,
  };
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
      if (!action.payload) return state;
      return {
        ...state,
        medications: state.medications.filter((m) => m.id !== action.payload),
        timers: state.timers.filter((t) => t.id !== action.payload),
        disposals: state.disposals.filter((d) => d.id !== action.payload),
      };

    case "ADD_TIMER": {
      const prev = state.timers.find((t) => t.id === action.payload.id);
      const timer = buildTimer(prev, action.payload);
      const idx = state.timers.findIndex((t) => t.id === timer.id);
      if (idx >= 0) {
        const updated = [...state.timers];
        updated[idx] = timer;
        return { ...state, timers: updated };
      }
      return { ...state, timers: [...state.timers, timer] };
    }

    case "UPDATE_TIMER": {
      const prev = state.timers.find((t) => t.id === action.payload.id);
      const timer = buildTimer(prev, action.payload);
      return {
        ...state,
        timers: state.timers.map((t) => (t.id === timer.id ? timer : t)),
      };
    }

    case "REMOVE_TIMER":
      if (!action.payload) return state;
      return {
        ...state,
        timers: state.timers.filter((t) => t.id !== action.payload),
      };

    case "ADD_DISPOSAL":
      return { ...state, disposals: [...state.disposals, action.payload] };

    case "REMOVE_DISPOSAL":
      if (!action.payload) return state;
      return {
        ...state,
        disposals: state.disposals.filter((d) => d.id !== action.payload),
      };

    case "ADD_INTAKE":
      return { ...state, intakes: [...state.intakes, action.payload] };

    case "UPDATE_INTAKE":
      return {
        ...state,
        intakes: state.intakes.map((i) =>
          i.id === action.payload.id ? { ...i, ...action.payload } : i
        ),
      };

    case "REMOVE_INTAKE":
      if (!action.payload) return state;
      return {
        ...state,
        intakes: state.intakes.filter((i) => i.id !== action.payload),
      };

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
  updateTimer: (t: TimerItem) => void;
  removeTimer: (id: string) => void;
  addDisposal: (d: DisposalItem) => void;
  removeDisposal: (id: string) => void;
  addIntake: (i: IntakeItem) => void;
  updateIntake: (i: IntakeItem) => void;
  removeIntake: (id: string) => void;
}>({
  state: initialState,
  setUser: () => {},
  clearUser: () => {},
  addLinked: () => {},
  updateLinked: () => {},
  removeLinked: () => {},
  addTimer: () => {},
  updateTimer: () => {},
  removeTimer: () => {},
  addDisposal: () => {},
  removeDisposal: () => {},
  addIntake: () => {},
  updateIntake: () => {},
  removeIntake: () => {},
});

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setUser = (u: User) => dispatch({ type: "SET_USER", payload: u });
  const clearUser = () => dispatch({ type: "CLEAR_USER" });

  const addLinked = (m: MedicationItem) => {
    const minutes = safeNumber(Number(m.intervalMinutes), 0);
    const times = sanitizeTimes(m.times);
    if (minutes <= 0 && times.length === 0 && !m.expiry) return;

    const item: MedicationItem = {
      ...m,
      intervalMinutes: minutes,
      times,
      countMode: minutes > 0 ? "manual" : times.length > 0 ? "auto" : "manual",
    };
    dispatch({ type: "ADD_LINKED", payload: item });
  };

  const updateLinked = (m: MedicationItem) => {
    const minutes = safeNumber(Number(m.intervalMinutes), 0);
    const times = sanitizeTimes(m.times);
    if (minutes <= 0 && times.length === 0 && !m.expiry) return;

    const item: MedicationItem = {
      ...m,
      intervalMinutes: minutes,
      times,
      countMode: minutes > 0 ? "manual" : times.length > 0 ? "auto" : "manual",
    };
    dispatch({ type: "UPDATE_LINKED", payload: item });
  };

  const removeLinked = (id: string) =>
    id && dispatch({ type: "REMOVE_LINKED", payload: id });

  const addTimer = (t: TimerItem) => {
    const prev = state.timers.find((x) => x.id === t.id);
    const timer = buildTimer(prev, t);
    dispatch({ type: "ADD_TIMER", payload: timer });
  };

  const updateTimer = (t: TimerItem) => {
    const prev = state.timers.find((x) => x.id === t.id);
    const timer = buildTimer(prev, t);
    dispatch({ type: "UPDATE_TIMER", payload: timer });
  };

  const removeTimer = (id: string) =>
    id && dispatch({ type: "REMOVE_TIMER", payload: id });

  const addDisposal = (d: DisposalItem) =>
    dispatch({ type: "ADD_DISPOSAL", payload: d });

  const removeDisposal = (id: string) =>
    id && dispatch({ type: "REMOVE_DISPOSAL", payload: id });

  const addIntake = (i: IntakeItem) =>
    dispatch({ type: "ADD_INTAKE", payload: i });

  const updateIntake = (i: IntakeItem) =>
    dispatch({ type: "UPDATE_INTAKE", payload: i });

  const removeIntake = (id: string) =>
    id && dispatch({ type: "REMOVE_INTAKE", payload: id });

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
        updateTimer,
        removeTimer,
        addDisposal,
        removeDisposal,
        addIntake,
        updateIntake,
        removeIntake,
      }}
    >
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore() {
  return useContext(AppStoreContext);
}
