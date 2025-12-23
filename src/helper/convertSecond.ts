export const convertSecond = (d: number | string) => {
  const sec = Math.floor(Number(d) || 0);

  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  }

  return `${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
};
