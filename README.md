# How to use

## Install dependencies

```
npm install
```

- tested with node v16.13.2 and npm v8.4.0

## Download mp3 files

```
npm run download
```

- all downloaded data will be in `data/` folder
- download runs in parallel (10 files at a time)
- `list.json` is downloaded first, and then used to gerenate all other links
- if asset is already present in destination, it's download is skipped
- to refresh collection, delete old `list.json`
- be ready to have >120GB of free space on disk

## Generate convenient page to listen music

```
npm run generate
```

- page will be in `dist/index.html` will be generated
- it will use internet site links, not your local links

🌍 **Demo**: https://astef.github.io/artlebedev-dj-crawler
