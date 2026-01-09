import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { routerReducer, RouterReducerState } from '@ngrx/router-store';
import { authReducer, AuthState } from './auth/auth.reducer';

// Define the application state interface
export interface AppState {
  router: RouterReducerState<any>;
  auth: AuthState;
}

// Define the reducers map
export const reducers: ActionReducerMap<AppState> = {
  router: routerReducer,
  auth: authReducer,
};

// Define meta reducers for development/production
export const metaReducers: MetaReducer<AppState>[] = [];