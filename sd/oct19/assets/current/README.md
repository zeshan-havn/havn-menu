# Weekly image digest contract

`manifest.json` is the release receipt for the ten local meal images used by the member menu. The slot names are stable because the menu generator and order logic use them; the hashes prove that the files actually changed with the week.

For every generated-menu run:

1. Export the ten finalized HQ meal images to the matching slot files in this folder (`special.jpg` through `salad_2.jpg`). Keep them local and credential-free.
2. Update the week, finalized-menu source digest, image source paths, source SHA-256 values, and output SHA-256 values in `manifest.json`.
3. Copy the current QA contract to the new week (or update its expected date, names, and macro rows), then run its `menu-scenarios.mjs`. The replay should fail until the rendered menu and all ten image bytes match the new weekly contract.
4. Record the release-level digest with `shasum -a 256 index.html assets/current/manifest.json`. Include both values in the generated-menu handoff so a reviewer can distinguish weekly data from weekly imagery.

The manifest is deploy evidence, not runtime state. The menu still works as a static page and requires no secret or API call.
