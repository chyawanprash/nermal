## nermalist
![hero](assets/hero.png)

don't let the big brother stalk you 

nermalist: a basic encryption based notes app written in tauri and svelte (mainly dependent on zstd + aes 256 in core logic)

### demo For nerds 
https://github.com/user-attachments/assets/5d188e8c-948d-4bca-9cce-f2062c18ee06

---
## getting started

Grab the latest build for your platform from the [Releases](https://github.com/chyawanprash/nermalist/releases) page.

### macOS

The app isn't code-signed/notarized yet, so macOS Gatekeeper will refuse to open it with a "damaged" or "can't be opened" warning. After moving `nermalist.app` to `/Applications`, clear the quarantine flag from Terminal:

```bash
xattr -dr com.apple.quarantine /Applications/nermalist.app
```

---
## license

[![GPL v3](https://www.gnu.org/graphics/gplv3-127x51.png)](LICENSE)


---

