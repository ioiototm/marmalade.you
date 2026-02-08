---
title: "Submit"
description: "Share your Marmalade remix, fan art, or creation."
---

{{< submit-intro >}}Share a remix, an asset, a clip, a model, a meme.{{< /submit-intro >}}

{{< submit-split >}}
{{< submit-card title="Option 1: The Git Way" subtitle="For the coders" >}}
This website is open source. The best way to submit is to add yourself to the database.

<ol class="list-decimal ml-5 mb-4">
<li>Fork the repository on GitHub.</li>
<li>Edit <code>data/remixes.yaml</code>.</li>
<li>Add your entry (title, image, date, link/author optional).</li>
<li>Open a Pull Request.</li>
</ol>

<p class="muted mt-4">Anonymous is totally fine:</p>
<ul class="list">
  <li><strong>No author?</strong> Leave <code>author</code> blank (it will show as "Anonymous").</li>
  <li><strong>No link?</strong> You can omit <code>link</code>.</li>
  <li><strong>Local image?</strong> Use <code>/images/remixes/your-image.png</code> and add the file under <code>static/images/remixes/</code>.</li>
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
  # Anonymous + no link + local image
  - title: "Hand-drawn sticker sheet"
    author: ""            # blank = Anonymous
    link: ""              # optional
    license: "CC0"         # optional (when "CC0", shows the CC0 stamp)
    image: "/images/remixes/sticker-sheet.png"  # add file under static/images/remixes/
    note: "Scanned from paper, cleaned up in Krita."
    type: "Art"
    date: "2026-01-11"

  # Named + link + external image
  - title: "Marmalade fan animation"
    author: "@yourhandle"
    link: "https://example.com/post"
    license: ""            # optional
    image: "https://example.com/preview.png"
    note: "10-second loop."
    type: "Animation"
    date: "2026-01-11"
```

{{< /submit-details >}}
{{< /submit-card >}}

{{< submit-card class="mt-32" title="Moderation" subtitle="Please follow these guidelines." >}}
<ul class="list">
  <li>No hate/harassment.</li>
  <li>No stolen copyrighted work (remixes of CC0/Marmalade are fine!).</li>
  <li>No malware or dangerous files.</li>
  <li><strong>Tool Agnostic:</strong> AI, traditional, digital, code, music. All welcome.</li>
</ul>
{{< /submit-card >}}
