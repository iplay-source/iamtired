
# iamtired 🌌

**The spatial operating system for your mind.**
*Infinite canvas. Rich documents. AI-native.*

![License](https://img.shields.io/badge/license-GPLv3-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![AI](https://img.shields.io/badge/AI-Powered-8e75ff.svg)

<br />

<!-- 
    PLACEHOLDER: Replace 'screenshot.png' with your actual screenshot URL or path 
-->
![Application Screenshot](https://placehold.co/1200x600/18181b/ffffff?text=Add+Your+Screenshot+Here)

<br />

---

## Why iamtired?

Most tools force you to choose between a whiteboard and a document editor. **iamtired** fuses them into a single, seamless engine for thought.

### 🚀 Think Without Borders
Break free from linear documents. Organize your ideas the way your brain actually works—spatially.
*   **Infinite Canvas:** Pan, zoom, and sprawl your ideas across a boundless workspace.
*   **Visual Logic:** Connect concepts with labeled edges to map relationships, arguments, and workflows.
*   **Adaptive Interface:** A glassmorphism UI that looks stunning in Light and Dark modes, with a grid that scales as you zoom.

### ✍️ Write With Power
Don't sacrifice depth for space. Every node is a fully-featured word processor.
*   **WYSIWYG Markdown:** Write beautiful content with headers, lists, and code blocks directly on the canvas.
*   **Distraction-Free Focus:** Double-click any node to enter a dedicated writing mode, fading out the noise.
*   **Rich Media:** Drag-and-drop images or embed URLs instantly.

### 🧠 Your AI Co-Pilot
Integrated deeply into the workflow, not just a sidebar chat.
*   **Context-Aware Branching:** Stuck? Click "Branch" and watch the AI read your current node to generate relevant, connected ideas automatically.
*   **Semantic Editing:** Highlight text and command the AI to "Fix grammar," "Summarize," or "Make it punchier."
*   **Multi-Model Freedom:** Bring your own keys. Native support for **Google Gemini, OpenAI, Claude, OpenRouter, and Local LLMs (Ollama)**.

### 🔒 Privacy by Design
Your thoughts belong to you.
*   **Local-First Architecture:** All data is saved instantly to your browser's local storage.
*   **No Vendor Lock-in:** Export your entire brain graph to JSON at any time.
*   **Zero-Database:** We don't store your data. Your API keys live on your device, nowhere else.

---

## 🛠️ Tech Stack

*   **Framework:** React 19
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **AI Engine:** Google GenAI SDK & Standard REST APIs
*   **Core:** `react-markdown` / `remark-gfm`

---

## 🚀 Getting Started

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/iamtired.git
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Server**
    ```bash
    npm start
    ```

4.  **Configure AI**
    Launch the app and click the **Settings** icon. Enter your API key for your preferred provider (Gemini, OpenAI, etc.) to unlock the full potential of the engine.

---

## 🎮 Controls

| Action | Control |
| :--- | :--- |
| **Pan Canvas** | Hold `Space` + Drag |
| **Zoom** | `Ctrl`/`Cmd` + Scroll |
| **Select Node** | Click |
| **Edit Node** | Double Click |
| **Branch Node** | Click `Branch` Icon or Context Menu |
| **Connect Nodes** | Drag from Node Handle (Blue Dot) |
| **Edit Link Label** | Click Link / Press Enter to Save |
| **Save/Load** | `Ctrl + S` / Toolbar Menu |
