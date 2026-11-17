# Vid-o-ugc

Instagram / UGC video editing toolkit, driven by Claude Code.

| Tool | What it does | How it runs here |
|---|---|---|
| Remotion | titles + animation | `npx remotion render remotion/index.jsx TitleCard out/title.mp4` |
| HyperFrames | background cutouts, TTS, captions | `npx hyperframes remove-background in.mp4 -o cutout.webm` |
| FFmpeg | cutting + audio + burning captions | system `ffmpeg` |
| Whisper (whisper.cpp) | auto captions | `npx hyperframes transcribe clip.mp4 --engine whisper --model base.en --to srt -o clip.srt` |
| yt-dlp | pull your own Reels | `yt-dlp <url>` (needs Instagram hosts allowed on the network) |

Setup: `npm install` and `pip install yt-dlp`.
