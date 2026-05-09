import dayjs from "dayjs";
import type { Photo } from "@/src/shared/db/schema";

export function groupPhotosByMonth(photos: Photo[]): Map<string, Photo[]> {
  const map = new Map<string, Photo[]>();
  for (const photo of photos) {
    const monthKey = dayjs.unix(photo.createdAt).format("YYYY-MM");
    if (!map.has(monthKey)) map.set(monthKey, []);
    map.get(monthKey)?.push(photo);
  }
  return map;
}

export function groupPhotosByDay(photos: Photo[]): Map<string, Photo[]> {
  const map = new Map<string, Photo[]>();
  for (const photo of photos) {
    const dayKey = dayjs.unix(photo.createdAt).format("YYYY-MM-DD");
    if (!map.has(dayKey)) map.set(dayKey, []);
    map.get(dayKey)?.push(photo);
  }
  return map;
}