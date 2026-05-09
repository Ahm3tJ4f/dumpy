import dayjs from "dayjs";
import { asc, sql } from "drizzle-orm";
import { db } from "@/src/shared/db/client";
import { photos } from "@/src/shared/db/schema";
import type { Photo } from "@/src/shared/db/schema";

export async function getPhotosByYear(year: string): Promise<Photo[]> {
  const startDate = dayjs().year(parseInt(year)).startOf("year");
  const endDate = startDate.endOf("year");
  return db
    .select()
    .from(photos)
    .where(
      sql`${photos.createdAt} >= ${startDate.unix()} AND ${photos.createdAt} <= ${endDate.unix()}`,
    )
    .orderBy(asc(photos.createdAt), asc(photos.sortOrder));
}
