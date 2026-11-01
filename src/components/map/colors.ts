const DAY_COLORS = ["#0a6cbf", "#0f9aa0", "#f2683c", "#7a5af8", "#1f8a4c", "#b26a00", "#d6336c"];
export const dayColor = (i: number) => DAY_COLORS[i % DAY_COLORS.length];
