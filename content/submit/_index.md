---
title: "Submit"
description: "Share your Marmalade remix, fan art, or creation."
---

{{< submit-intro >}}If you made something with Marmalade, or she inspired you, send it over!{{< /submit-intro >}}

{{< submit-split >}}
{{< submit-card title="Option 1: The Git Way" subtitle="For the coders" >}}
The website is open source, so if you know Git, you can add your thing yourself!

<ol class="list-decimal ml-5 mb-4">
<li>Fork the repository on GitHub.</li>
<li>Edit <code>data/remixes.yaml</code>.</li>
<li>Add your entry (title, image, date; link, author and <code>based_on</code> optional).</li>
<li>Open a Pull Request (the template asks two quick questions if you're releasing it as CC0).</li>
</ol>

<p class="muted mt-4">Anonymous is totally fine:</p>
<ul class="list">
  <li><strong>No author?</strong> Leave <code>author</code> blank (it will show as "Anonymous").</li>
  <li><strong>No link?</strong> You can omit <code>link</code>.</li>
  <li><strong>Local image?</strong> Use <code>/images/remixes/your-image.png</code> and add the file under <code>static/images/remixes/</code>.</li>
  <li><strong>Based on a Mal piece?</strong> Add <code>based_on</code> and it shows up in <a href="/family/">Mal's family tree</a>. The names are listed under the examples below.</li>
  <li><strong>Releasing it as CC0?</strong> Set <code>license: "CC0"</code> and tick both CC0 boxes in the Pull Request. CC0 is permanent: anyone can use, change and sell your piece without asking or crediting you, and it can't be undone.</li>
</ul>

<a class="btn btn-primary" href="https://github.com/ioiotoTM/marmalade.you" target="_blank" rel="noopener noreferrer">
  <span class="icon">GitHub</span> Fork & PR
</a>
{{< /submit-card >}}

{{< submit-card title="Option 2: The Easy Way" subtitle="For everyone else" >}}
Drop a link to your work (Twitter, Itch, ArtStation, etc.) and I'll add it.

<ul class="list">
  <li><strong>No link?</strong> Use the note to describe what you made.</li>
  <li><strong>Need to send a file?</strong> Tell me how to get it (email, Discord, temporary download link).</li>
</ul>

{{< submit-form >}}
{{< /submit-card >}}
{{< /submit-split >}}

{{< submit-card class="mt-32" title="Examples (Option 1)" subtitle="Copy/paste templates for Git submissions." >}}
<p class="muted">These are for the Git Way only (editing <code>data/remixes.yaml</code>).</p>
{{< submit-details summary="YAML example (Git Way)" >}}

```yaml
remixes:
  # Anonymous + no link + local image, released as CC0, based on one Mal piece
  - title: "Hand-drawn sticker sheet"
    author: ""            # blank = Anonymous
    link: ""              # optional
    license: "CC0"        # optional: "CC0" releases it to the public domain (permanent!)
                          #   and shows the CC0 eye; tick both CC0 boxes in your Pull Request
    image: "/images/remixes/sticker-sheet.png"  # add file under static/images/remixes/
    note: "Scanned from paper, cleaned up in Krita."
    type: "Art"
    date: "2026-01-11"
    based_on: ["marmalade-curious"]   # optional: what it grew out of (names listed below)

  # Named + link + external image, all rights kept, based on two pieces (one a fan piece)
  - title: "Marmalade fan animation"
    author: "@yourhandle"
    link: "https://example.com/post"
    license: ""           # blank = you keep all rights, that's fine too
    image: "https://example.com/preview.png"
    note: "10-second loop."
    type: "Animation"
    date: "2026-01-11"
    based_on: ["marmalade-rock", "community:marmalade-bead-art"]
```

{{< /submit-details >}}
{{< submit-details summary="Names you can use in based_on" >}}
Pieces from The Source use their folder name (the last part of the page address). Pieces from In The Wild use <code>community:</code> plus their title in lowercase with dashes.

{{< based-on-keys >}}
{{< /submit-details >}}
{{< /submit-card >}}

{{< submit-card class="mt-32" title="Moderation" subtitle="Just a few rules." >}}
<ul class="list">
  <li>No hate/harassment.</li>
  <li>No stolen copyrighted work (remixes of CC0/Marmalade are fine!).</li>
  <li>No malware or dangerous files.</li>
  <li><strong>Any</strong> tools are fine: AI, traditional, digital, code, music, whatever you like.</li>
</ul>
{{< /submit-card >}}
