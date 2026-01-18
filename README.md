# JSON Formatter

A lightweight, privacy-first JSON formatter web app for developers. Format, validate, and share JSON instantly — all client-side with zero tracking.

## Features

### Core Functionality
- ✅ **Real-time validation** - JSON validates as you type
- ✅ **Auto-format** - Pretty prints valid JSON automatically
- ✅ **Syntax highlighting** - Monaco Editor with JSON support
- ✅ **Error detection** - Shows line/column info for invalid JSON
- ✅ **Line numbers & code folding** - Full editor experience

### Multi-Tab System
- ✅ **Create new tabs** - Work with multiple JSON documents
- ✅ **Close & rename tabs** - Double-click to rename
- ✅ **Independent tabs** - Each tab maintains its own state
- ✅ **Persistent tabs** - Tabs restore on page reload

### Formatting Options
- ✅ **Indent size** - 2 spaces, 4 spaces, or tabs
- ✅ **Minify/Expand** - Toggle between compact and pretty print
- ✅ **Manual format** - Format button for on-demand formatting

### Toolbar Actions
- ✅ **Copy** - Copy formatted JSON to clipboard
- ✅ **Download** - Save as .json file
- ✅ **Upload** - Load JSON from file
- ✅ **Share** - Generate shareable URL
- ✅ **Clear** - Reset editor content

### Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Format JSON |
| `Ctrl/Cmd + T` | New tab |
| `Ctrl/Cmd + W` | Close tab |
| `Ctrl/Cmd + K` | Clear editor |
| `Ctrl/Cmd + D` | Duplicate tab |

### Privacy & Security
- ✅ **Zero backend** - Everything runs in your browser
- ✅ **Zero analytics** - No tracking whatsoever
- ✅ **Zero cookies** - No cookies set
- ✅ **Works offline** - Full functionality without internet
- ✅ **Local storage only** - Data stays on your device

## Tech Stack

- **React 18** + TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Monaco Editor** - VS Code's editor
- **LZ-String** - URL compression for sharing

## Getting Started

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

## Deployment

This is a static site that can be deployed anywhere:

### Vercel
```bash
npm run build
# Deploy the 'dist' folder
```

### Netlify
```bash
npm run build
# Deploy the 'dist' folder
```

### Any static hosting
The `dist` folder contains everything needed for deployment.

## Project Structure

```
src/
├── components/
│   ├── Editor/
│   │   ├── JsonEditor.tsx      # Monaco editor wrapper
│   │   ├── EditorToolbar.tsx   # Toolbar with actions
│   │   ├── ErrorDisplay.tsx    # Error message display
│   │   └── StatusBar.tsx       # Line/char count
│   ├── Tabs/
│   │   ├── TabBar.tsx          # Tab container
│   │   └── TabItem.tsx         # Individual tab
│   ├── Layout/
│   │   ├── Header.tsx          # App header
│   │   └── Footer.tsx          # App footer
│   └── ui/                     # Shadcn components
├── hooks/
│   ├── useTabs.ts              # Tab management
│   └── useKeyboardShortcuts.ts # Shortcut handling
├── utils/
│   ├── jsonFormatter.ts        # JSON validation/formatting
│   ├── storage.ts              # localStorage helpers
│   ├── shareUrl.ts             # URL encoding/decoding
│   └── fileHandler.ts          # File upload/download
├── types/
│   └── index.ts                # TypeScript types
└── pages/
    ├── Index.tsx               # Main app
    └── Privacy.tsx             # Privacy policy
```

## License

MIT
