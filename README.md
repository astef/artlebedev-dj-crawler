# How to use

```
npm install

npm run start
```

 - all downloaded data will be in `data/` folder
 - download runs in parallel (10 files at a time)
 - `list.json` is downloaded first, and then used to gerenate all other links
 - if asset is already present in destination, it's download is skipped
 - tested with node 16
