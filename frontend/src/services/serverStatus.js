// Tiny observable store that tracks whether the backend is responding.
//
// The Render free tier sleeps after 15 idle minutes and takes ~50s to wake.
// Instead of a frozen spinner we surface a friendly "waking up" banner when
// any request has been pending for more than a few seconds.

const SLOW_AFTER_MS = 3500;

let state = { status: 'unknown', pending: 0 }; // status: unknown | online | waking | offline
const listeners = new Set();
const slowTimers = new Map();
let nextId = 1;

function emit(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(state));
}

export const serverStatus = {
  get: () => state,
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  /** Call when a request starts. Returns an id to pass to `end`. */
  start() {
    const id = nextId++;
    emit({ pending: state.pending + 1 });
    slowTimers.set(id, setTimeout(() => {
      if (state.status !== 'online' || state.pending > 0) emit({ status: 'waking' });
    }, SLOW_AFTER_MS));
    return id;
  },
  /** `reachable` = the server answered (any HTTP status other than 502-504). */
  end(id, reachable) {
    if (!slowTimers.has(id)) return;
    clearTimeout(slowTimers.get(id));
    slowTimers.delete(id);
    emit({ pending: Math.max(0, state.pending - 1), status: reachable ? 'online' : 'offline' });
  },
  markOnline: () => emit({ status: 'online' }),
};
