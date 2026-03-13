import { create } from "zustand";

interface Job {
  jobId: number;
  title: string;
  description: string;
  employer: string;
  isActive: boolean;
  escrowAmount: bigint;
  applicationCount: number;
}

interface Application {
  applicationId: number;
  jobId: number;
  candidate: string;
  isMatched: boolean;
}

interface AppState {
  // Jobs cache
  jobs: Map<number, Job>;
  setJob: (jobId: number, job: Job) => void;

  // Applications cache
  applications: Map<number, Application>;
  setApplication: (appId: number, app: Application) => void;

  // UI state
  selectedJobId: number | null;
  setSelectedJobId: (id: number | null) => void;

  // FHE status
  fheStatus: "idle" | "encrypting" | "encrypted" | "computing" | "revealed";
  setFheStatus: (
    status: "idle" | "encrypting" | "encrypted" | "computing" | "revealed"
  ) => void;

  // Connection
  isWalletConnected: boolean;
  setWalletConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  jobs: new Map(),
  setJob: (jobId, job) =>
    set((state) => {
      const newJobs = new Map(state.jobs);
      newJobs.set(jobId, job);
      return { jobs: newJobs };
    }),

  applications: new Map(),
  setApplication: (appId, app) =>
    set((state) => {
      const newApps = new Map(state.applications);
      newApps.set(appId, app);
      return { applications: newApps };
    }),

  selectedJobId: null,
  setSelectedJobId: (id) => set({ selectedJobId: id }),

  fheStatus: "idle",
  setFheStatus: (status) => set({ fheStatus: status }),

  isWalletConnected: false,
  setWalletConnected: (connected) => set({ isWalletConnected: connected }),
}));
