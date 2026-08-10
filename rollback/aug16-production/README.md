# Immediate Aug 16 menu rollback

`index.html` in this folder is the exact pre-rebuild page from commit `d2dcc88`.

From the repository root:

```sh
cp rollback/aug16-production/index.html index.html
git add index.html
git commit -m "rollback(menu): restore pre-rebuild Aug 16 page"
```

The preview images and weekly data do not change during this visual rebuild, so restoring the single file restores the production UI and order behavior. Deployment remains a separate, explicit action.
