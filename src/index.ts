import axios, { isAxiosError } from "axios";
import fs from "fs/promises";
import { existsSync } from "fs";
import { getList } from "./common";

let globalInProgress = 0;

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
      console.log(`[ERROR] ${name} ${error.message}`);
      await fs.appendFile(
        "data/errors.log",
        `${new Date().toISOString()};${name}; ${error.message}\n`
      );
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
