import fs from "fs/promises";
import { existsSync } from "fs";
import axios from "axios";
import { z } from "zod";

const noTrackItemType = z.object({ noTrack: z.literal("Y") });
const trackItemType = z.object({
  set: z.object({ url: z.string(), size: z.number() }),
});

const baseItemType = z.object({
  id: z.string(),

  name: z.string(),
  playlist_set: z.array(z.string().or(z.array(z.string()))),
  img: z.object({ name: z.string() }),
  date: z.string(),
  string_date: z.string(),
  city: z.string(),
  quote: z.string(),
  url: z.string(),
  tags: z.array(z.string()),
  soundcloud_url: z.string(),
  web_name: z.string(),
  similar: z
    .record(
      z.string(),
      z.object({
        id: z.string(),
        name: z.string(),
        date: z.string(),
        string_date: z.string(),
      })
    )
    .optional(),
});

const listType = z.array(
  baseItemType.and(z.union([noTrackItemType, trackItemType]))
);

export async function getList() {
  const listFilePath = "data/list.json";
  if (!existsSync("data")) {
    await fs.mkdir("data");
  }

  if (!existsSync(listFilePath)) {
    const resp = await axios.get(
      "https://www.artlebedev.ru/dj/json/list.html",
      {
        headers: { "Accept-Encoding": "identity" },
      }
    );

    await fs.writeFile(listFilePath, JSON.stringify(resp.data), {
      encoding: "utf-8",
    });
  }
  const fileContent = await fs.readFile(listFilePath, {
    encoding: "utf-8",
  });
  return listType.parse(JSON.parse(fileContent));
}
