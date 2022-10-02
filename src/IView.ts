import { AnimObject, MemberObject } from "./BattleObjects";
import { Event } from "./Event";
import { IResources, Music } from "./IResources";
import Status from "./Status";

interface IView {
    resources: IResources;

    update(): void;

    getPlayerStatus(): Status;
    getOpponentStatus(): Status;
    setStatus(isPlayer: boolean, status: Partial<Status>): void;

    setPlayerTexture(id?: string): void;
    setOpponentTexture(id?: string): void;

    slideInTrainers(): Event;
    slideInOpponentTrainer(): Event;
    slideOutPlayerTrainer(): Event;
    slideOutOpponentTrainer(): Event;
    showPlayerTeamStatus(hp: number[]): Event;
    showOpponentTeamStatus(hp: number[]): Event;
    hidePlayerTeamStatus(): Event;
    hideOpponentTeamStatus(): Event;
    showPlayerStats(member?: MemberObject): Event;
    showOpponentStats(member?: MemberObject): Event;
    hidePlayerStats(): Event;
    hideOpponentStats(): Event;
    showPlayer(): Event;
    showOpponent(): Event;
    hidePlayer(): Event;
    hideOpponent(): Event;
    screenShake(): Event;
    invertColors(): Event;
    toggleGrayScale(): Event;
    clearTextbox(): Event;
    text(text: string[], auto?: boolean): Event;
    effect(name: string, isPlayer: boolean): Event | undefined;
    sfx(name: string, wait?: boolean, panning?: number): Event;
    cry(id: string, wait: boolean, isPlayer: boolean): Event;
    shader(isPlayer: boolean, name: string, steps: number, delay: number, reverse: boolean): Event
    particle(t: string, ...args: (number | string | string[])[]): Event;
    anim(id: string, anim: AnimObject): Event;

    startMusic(music: Music): void;
}

export default IView;