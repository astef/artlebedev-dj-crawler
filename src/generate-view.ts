import m from "mustache";
import { existsSync } from "fs";
import fs from "fs/promises";
import { getList } from "./common";

async function main() {
  const list = await getList();

  let view: { id: string; similar_ids: string[]; playlist_set_text: string }[] =
    [];

  for (const item of list) {
    if ("noTrack" in item) {
      continue;
    }
    view.push({
      ...item,
      similar_ids: item.similar ? Object.keys(item.similar as object) : [],
      playlist_set_text: item.playlist_set.join("<br/>"),
    });
  }

  for (const viewItem of view) {
    viewItem.similar_ids = viewItem.similar_ids.filter((id) =>
      view.find((i) => i.id === id)
    );
  }

  if (!existsSync("dist")) {
    await fs.mkdir("dist");
  }

  await fs.writeFile(
    "dist/index.html",
    m.render(await fs.readFile("src/index.html", { encoding: "utf-8" }), view)
  );
}

main();
