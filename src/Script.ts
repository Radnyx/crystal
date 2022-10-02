import Status from "./Status";

type Script = 
    { do: "SFX", name: string, panning?: number, wait?: boolean } | 
    { do: "CRY", isPlayer: boolean, index: number } |
    { do: "TEXT", text: string[], auto?: boolean } |
    { do: "WAIT", frames: number } | 
    { do: "MOVE_SFX", move: string, isPlayer: boolean } |
    { do: "EFFECT", name: string, isPlayer: boolean } |
    { do: "SET_STATUS", isPlayer: boolean, status: Partial<Status> } |
    { do: "SET_PLAYER", index: number} |
    { do: "SET_OPPONENT", index: number } |
    { do: "PARTICLE", type: string, args: (number | string | string[])[] } |
    { do: "SHADER", isPlayer:boolean, name: string, steps: number, delay: number} |
    { do: "HEALTH", isPlayer:boolean, hp:number, skipAnimation?: boolean } |
    { do: "LOAD_MOVE", move: string } |
    /*
        TODO: in future, have SpriteID like "OPPONENT_SPRITE", "PLAYER_LEADER_SPRITE"
        and it can somehow refer to an image defined in the metadata...
    */
    { do: "ANIMATE", index: number } |
    "CLEAR_TEXT" |
    "SLIDE_IN_TRAINERS" |
    "SLIDE_IN_OPPONENT_TRAINER" |
    "SLIDE_OUT_PLAYER_TRAINER" |
    "SLIDE_OUT_OPPONENT_TRAINER" |
    "SHOW_PLAYER_TEAM_STATUS" |
    "SHOW_OPPONENT_TEAM_STATUS" |
    "HIDE_PLAYER_TEAM_STATUS" |
    "HIDE_OPPONENT_TEAM_STATUS" |
    "SHOW_PLAYER_STATS" |
    "SHOW_OPPONENT_STATS" |
    "HIDE_PLAYER_STATS" |
    "HIDE_OPPONENT_STATS" |
    "SCREEN_SHAKE" |
    "INVERT_COLORS" |
    "TOGGLE_GRAY_SCALE" |
    "SHOW_PLAYER" |
    "HIDE_PLAYER" |
    "SHOW_OPPONENT" |
    "HIDE_OPPONENT" |
    "SLIDE_OUT_PLAYER" |
    "SLIDE_OUT_OPPONENT" |
    "PLAY_VICTORY_MUSIC" |
    // interaction commands
    "OPTIONS" | // move to options
    "PASS" | // skip options, for moves like Fly
    "FORCE_PLAYER_SWITCH" | // force play to choose a new member
    Script[] |
    undefined |
    null;

namespace Scripts {
    export function isSubCommand(script: Script): script is Script[] {
        return Array.isArray(script);
    }

    export function flatten(script: Script): Script {
        if (isSubCommand(script)) {
            if (script.length === 0) {
                return null;
            }
            return script.flatMap(flatten).filter(x => x != null);
        }
        return script;
    }
}

export { Script, Scripts };