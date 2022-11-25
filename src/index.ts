import axios, { isAxiosError } from "axios";
import fs from "fs/promises";
import { existsSync } from "fs";
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

let globalInProgress = 0;

async function getList() {
  const listFilePath = "data/list.json";
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

async function getSet(name: string) {
  const filePath = `data/${name}`;
  if (existsSync(filePath)) {
    console.log(`[CACHE_HIT] ${name}`);
    return;
  }

  try {
    console.log(`[STARTED] ${name}`);
    globalInProgress++;

    const resp = await axios.get(`https://dj.artlebedev.ru/mp3/${name}`, {
      responseType: "arraybuffer",
    });

    console.log(`[DOWNLOADED] ${name}`);

    await fs.writeFile(filePath, resp.data);
    globalInProgress--;
  } catch (error) {
    if (isAxiosError(error)) {
      console.log(`[ERROR] ${name}`);
      console.log(error.message);
      console.log(error.response);
    } else {
      throw error;
    }
  }
}

async function main() {
  const list = await getList();

  const requests = [];

  for (let i = 0; i < list.length; i++) {
    while (globalInProgress > 10) {
      console.log("Waiting...");
      await new Promise((r) => setTimeout(r, 5000));
    }

    const item = list[i];
    if ("set" in item) {
      requests.push(getSet(item.set.url));
    }
  }

  await Promise.all(requests);
}

main();
