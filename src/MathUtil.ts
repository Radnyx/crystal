export function lerp(t: number) {
    return (a: number, b: number) => {
        return a * (1 - t) + b * t;
    }
}