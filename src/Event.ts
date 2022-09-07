import Status from "./Status";

interface EventState {
    // used if a certain event has a flag for waiting
    waiting: boolean;
    // used for health bar changes
    hpStart: number;
    hpEnd: number;
    // used to wait until an event ends
    duration: number;
    // store any reference here (NOT TYPE-CHECKED!)
    object: any;
    // remember IDs for player/opponent
    playerId?: string;
    opponentId?: string;
}

interface Event {
    init?: (() => void) | ((state: EventState) => void);
    done?: ((tick: number, state: EventState) => boolean);
    next?: Event;
    // reference to last event, this allows O(1) appending to list
    last?: Event;
}

type DeepEvent = (() => void) | Event | DeepEvent[] | undefined;

namespace Events {
    export function append(event: Event, next?: Event) {
        let evt = event.last || event;
        while (evt.next != null) {
            evt = evt.next;
        }
        evt.next = next;
        event.last = next?.last || event.last || next;
    }

    export function flatten(script: DeepEvent): Event {
        if (script == null) return {};
        if (typeof script === "function") {
            return { init: script as () => void };
        }
        if (!Array.isArray(script)) {
            return script as Event;
        }
        const events = (script as DeepEvent[]).map(flatten);
        if (events.length === 0) return {};
        for (let i = 0; i < events.length - 1; i++) {
            append(events[i]!, events[i + 1]);
        }
        return events[0]!;
    }

    export function wait(frames: number): Event {
        return { done: t => t >= frames };
    }

    export function changeHealth(status: Status, hpEnd: number): Event {
        return {
            init: state => {
                state.hpStart = status.hp;
                state.hpEnd = hpEnd;
                state.duration = Math.abs(state.hpStart - hpEnd);
            },
            done: (t, state) => {
                const { duration, hpStart, hpEnd } = state;
                const progress = t / duration;
                status.hp = Math.floor(hpEnd * progress + hpStart * (1.0 - progress));
                return t >= duration;
            }
        };
    }
}

class EventDriver {

    private current?: Event;

    // count number of ticks passed in current event
    private ticks: number = 0;

    private readonly state: EventState;

    constructor() {
        this.state = {
            waiting: false,
            hpStart: 0,
            hpEnd: 0,
            duration: 0,
            object: null,
            playerId: undefined,
            opponentId: undefined
        };
    }

    update() {
        if (this.running()) {
            while (
                this.running() && 
                (!this.current!.done || this.current!.done(this.ticks, this.state))
            ) {
                this.setEvent(this.current!.next);
            }
            this.ticks++;
        }
    }

    setEvent(event?: Event) {
        this.current = event;
        this.ticks = 0;
        if (event?.init != null) {
            event.init(this.state);
        }
    }

    append(event?: Event) {
        if (this.current == null) {
            this.setEvent(event);
        } else {
            Events.append(this.current, event);
        }
    }

    running(): boolean {
        return this.current != null;
    }

    force(event: Event) {
        event.init!(this.state);
    }
}

export { EventDriver, EventState, Event, DeepEvent, Events };