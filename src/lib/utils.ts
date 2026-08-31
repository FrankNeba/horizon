

export function generateTrackingId(): string {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const alphanumeric = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    const first2 = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
    const middle6 = Array.from({ length: 6 }, () => alphanumeric[Math.floor(Math.random() * alphanumeric.length)]).join("");
    const last2 = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");

    return `${first2}${middle6}${last2}`;
}

export function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(" ");
}
