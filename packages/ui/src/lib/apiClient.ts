// ─── Back-compat shim ────────────────────────────────────────────────────────
// The axios instance moved to `src/api/http.ts` (the single transport seam, DIP);
// the pure mediaUrl helper moved to `src/lib/media.ts`. This re-export keeps the
// redux slices working unchanged until Phase 2 migrates them to the `api/*.api.ts`
// repository modules. New code must NOT import this — use an `api/` module instead.
import http from '../api/http';

export { mediaUrl } from './media';
export default http;
