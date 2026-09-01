export type AppGlobalState =
  | 'FIRST_INSTALL'
  | 'LOADING'
  | 'READY'
  | 'REFRESHING'
  | 'OFFLINE'
  | 'EMPTY'
  | 'ERROR';

export interface AppStateContext {
  state: AppGlobalState;
  errorMessage?: string;
  lastRefreshedAt?: number;
  totalChannels: number;
  isStale: boolean;
}
