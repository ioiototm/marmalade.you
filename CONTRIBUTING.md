# Adding your stuff

If you made something with Marmalade (or she inspired you), I'd love to have it on the site (and I mean *anything*)! There are two ways:

- **Not into Git?** Use the [submit form](https://marmalade.you/submit/). Drop a link and I'll add it myself.
- **Know Git?** Add it yourself with a pull request. Here's how.

## Adding a piece to In The Wild

1. Fork the repo.
2. Add your entry to `data/remixes.yaml` (there are examples at the top of the file to copy).
3. Want the image hosted here? Put it in `static/images/remixes/` and use `/images/remixes/your-file.png` as the `image`. Otherwise just link to an image somewhere else. Please keep the file size reasonable.
4. Open a pull request and fill in the template.

```yaml
  - title: "Hand-drawn sticker sheet"
    author: "@yourhandle"    # leave blank and it shows as Anonymous
    link: "https://..."      # optional: where people can see it
    license: ""              # blank = you keep all rights. "CC0" = public domain (read below first!)
    image: "/images/remixes/sticker-sheet.png"
    thumbnail: ""            # optional: a still frame, for GIFs
    note: "Scanned from paper, cleaned up in Krita."
    type: "Art"
    date: "2026-01-11"
    based_on: ["marmalade-curious"]   # optional: the Mal piece(s) it grew out of
```

### based_on (the family tree)

If your piece grew out of one of mine, add `based_on` and it shows up as a branch in [Mal's family tree](https://marmalade.you/family/).

- Pieces from The Source use their folder name, the last bit of the page address (like `marmalade-rock`).
- Pieces from In The Wild use `community:` plus their title in lowercase with dashes (like `community:marmalade-bead-art`).

The full list is on the [submit page](https://marmalade.you/submit/), under "Names you can use in based_on".

### CC0 or not, your call

By default **you keep all the rights** to your piece, and its card on the site says so. That's completely fine!

If you want to release it as CC0 like Mal, set `license: "CC0"` and tick both boxes in the pull request template. Please read this first though: CC0 means anyone can use, change and sell your piece without asking or crediting you, and **it can't be undone**. If your piece includes someone else's art or character that isn't CC0, your CC0 only covers your part.

### The rules

Same as on the [submit page](https://marmalade.you/submit/):

- No hate/harassment.
- No stolen copyrighted work (remixes of CC0/Marmalade are fine!).
- No malware or dangerous files.
- **Any** tools are fine: AI, traditional, digital, code, music, whatever you like.

## Fixing something on the site

Found a typo, a broken link or a bug? Open an issue, or send a pull request if you know the fix, and tell me what you changed.

To run the site locally you need [Hugo](https://gohugo.io/) (extended), then run `hugo server -D` and open http://localhost:1313.

By sending code, you agree that it's released into the public domain under the [Unlicense](UNLICENSE), same as the rest of the site's code.
