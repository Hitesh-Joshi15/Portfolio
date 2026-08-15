// ===================================
// WORLD — STATE MACHINE
// Drives the navigation flow agreed in planning:
//   SEATED -> WALKING -> MONITOR -> CITY -> COMPONENT ...
// Slice 1 only exercises SEATED <-> WALKING, but the full set of
// states is declared now so later slices just plug in.
// ===================================

export const State = {
    SEATED: 'seated',
    WALKING: 'walking',
    MONITOR: 'monitor',
    CITY: 'city',
    COMPONENT: 'component',
    FOCUS: 'focus',
    BALCONY: 'balcony',
};

export class StateMachine {
    constructor(initial = State.SEATED) {
        this.current = initial;
        this.previous = null;
        this._stack = [];        // breadcrumb history for the universal "come out"
        this._listeners = new Set();
    }

    /** Move forward to a new state, remembering where we came from. */
    transition(next, ctx = {}) {
        if (next === this.current) return;
        this._stack.push(this.current);
        this.previous = this.current;
        this.current = next;
        this._emit(next, this.previous, ctx);
    }

    /** The universal "Come Out" — pop back to the prior state. */
    back(ctx = {}) {
        if (!this._stack.length) return false;
        const target = this._stack.pop();
        this.previous = this.current;
        this.current = target;
        this._emit(target, this.previous, { ...ctx, back: true });
        return true;
    }

    is(state) {
        return this.current === state;
    }

    /** Subscribe to changes: fn(next, prev, ctx). Returns an unsubscribe fn. */
    onChange(fn) {
        this._listeners.add(fn);
        return () => this._listeners.delete(fn);
    }

    _emit(next, prev, ctx) {
        this._listeners.forEach((fn) => {
            try {
                fn(next, prev, ctx);
            } catch (err) {
                console.error('[World] state listener error:', err);
            }
        });
    }
}
