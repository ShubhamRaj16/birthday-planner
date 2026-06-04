// Public API of @birthday-planner/ui — the shared React/Redux UI library
// consumed by apps/web (and, later, apps/desktop). Internal modules import each
// other by relative path; only this barrel is meant to cross the package edge.
export { default as App, type AppRoute } from './App';
export { createStore } from './redux/store';
export type { PreloadedState, AppStore, AppDispatch } from './redux/store';
export { createClientRoutes } from './routes/clientRoutes';
