export function dispLocalDateTime(isoDate) {
  const date = new Date(isoDate);
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  let hour = date.getHours();
  hour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedDate = `${month}.${day}.${year} ${hour.toString().padStart(2, "0")}:${minutes}${ampm}`;
  return formattedDate;
}

export function dispLocalDate(isoDate){
  const date = new Date(isoDate);
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const formattedDate = `${month}.${day}.${year}`;
  return formattedDate;
}

export function dispLocalDateWithDay(isoDate){
  const date = new Date(isoDate);
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const dayName = date.toLocaleString("en-US", { weekday: "long" });

  const formattedDate = `${dayName}, ${month}.${day}.${year}`;
  return formattedDate;
}

export function dispLocalDateWithShortDay(isoDate){
  const date = new Date(isoDate);
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  const dayName = date.toLocaleString("en-US", { weekday: "short" });

  const formattedDate = `${dayName}, ${month}.${day}.${year}`;
  return formattedDate;
}

export function dispLocalTime(isoDate){
  const date = new Date(isoDate);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  let hour = date.getHours();
  hour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedDate = `${hour.toString().padStart(2, "0")}:${minutes}${ampm}`;
  return formattedDate;
}