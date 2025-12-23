export const formatDuration = (duration: string | number): string => {
  let totalSeconds = 0;

  // Case 1: number ya numeric string (seconds)
  if (!isNaN(Number(duration))) {
    totalSeconds = parseInt(String(duration), 10);
  }

  // Case 2: HH:MM:SS (e.g. "01:34:48")
  else if (
    typeof duration === "string" &&
    /^\d{1,2}:\d{2}:\d{2}$/.test(duration)
  ) {
    const [hours, minutes, seconds] = duration.split(":").map(Number);
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
  }

  // Case 3: MM:SS (e.g. "24:30")
  else if (
    typeof duration === "string" &&
    /^\d{1,2}:\d{2}$/.test(duration)
  ) {
    const [minutes, seconds] = duration.split(":").map(Number);
    totalSeconds = minutes * 60 + seconds;
  }

  // Invalid format
  else {
    return "";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let displayString = "";

  if (hours > 0) {
    displayString += `${hours}h `;
  }

  if (minutes > 0 || hours > 0) {
    displayString += `${minutes} min `;
  }

  if (seconds > 0 && hours === 0 && minutes < 1) {
    displayString += `${seconds}s`;
  }

  return displayString.trim();
};
