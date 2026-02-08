# marmalade.you

Marmalade is a CC0 catgirl mascot. No rules, no permission needed, no gatekeeping.

This is the source code for [marmalade.you](https://marmalade.you) - a hub for sharing everything related to her: sticker packs, character sheets, CSP files, PNGtuber models, and whatever else people make.

One half is **The Source** (where I drop my files), the other is **In The Wild** (where you can show off what you've made with her).

## Run locally

You need [Hugo](https://gohugo.io/) (extended edition recommended).

```bash
hugo server -D
```

Then open http://localhost:1313

## How the site works

- `content/lab/` - each folder is a downloadable project (sticker, model, reference sheet, etc.)
- `data/remixes.yaml` - community submissions shown on the "In The Wild" page
- `static/stickers/` - sticker images used for thumbnails and the decorate feature
- `assets/css/` - styles (Hugo Pipes, fingerprinted)
- `assets/js/` - sticker drawer, identity widget, file downloads, form submission

Downloads are served from Cloudflare R2 via a Worker API. The site fetches version listings at runtime - no need to redeploy when you upload new files.

## Submit your work

Two ways:

1. **Fork & PR** - edit `data/remixes.yaml` and open a pull request
2. **The easy way** - use the submit form on the site

## License

Marmalade herself is **CC0 (public domain)**. Use her however you want.

The website code is released under the [Unlicense](UNLICENSE).
