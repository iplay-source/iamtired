# NoteVerse Canvas 🌌

### The Ultimate Knowledge Workspace.

**NoteVerse Canvas** is what happens when **Obsidian**, **Notion**, and **Excalidraw** have a child, raised by **Google Docs**.

It is an infinite spatial knowledge engine that fuses the freedom of a whiteboard with the power of a structured document editor. Connect ideas visually, write deeply, and expand your mind with integrated **Gemini AI**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![AI](https://img.shields.io/badge/Powered%20By-Gemini%20Flash%203-8e75ff.svg)

---

## ✨ Best of All Worlds

### 🎨 **Excalidraw-Style Infinite Canvas**
Why limit your thoughts to a page? **NoteVerse** gives you an infinite 2D plane. Pan, zoom, and arrange your notes spatially. Group related concepts visually, just like a whiteboard, but with full editing power.

### 🧠 **Obsidian-Style Graph Thinking**
Don't just write notes—connect them. Create a visual knowledge graph by linking nodes with drag-and-drop relationship lines. See exactly how your ideas connect, branch, and evolve.

### 📝 **Docs-Style WYSIWYG Editing**
Every node is a fully-featured text editor. Double-click to enter a focused writing mode with Markdown support, rich formatting, and seamless media integration. It feels familiar, powerful, and distraction-free.

### 🤖 **AI Native (Powered by Gemini)**
Stuck? Let the AI help.
*   **Auto-Drafting:** Turn a title into a full article in seconds.
*   **Smart Branching:** Explode a paragraph into a new, connected node with one click.
*   **Context Aware:** The AI understands the context of your connected notes to generate relevant content.

### 🖼️ **Rich Media Integration**
*   **AI Image Generation:** Visualize concepts instantly with Gemini 2.5 Flash Image.
*   **Web Search:** Ground your notes with real images from the web.

---

## 🛠️ Tech Stack

Built with the bleeding edge of modern web development:

*   **Core:** React 19 (RC)
*   **Styling:** Tailwind CSS + Lucide Icons
*   **AI Engine:** Google GenAI SDK (`@google/genai`)
*   **Models:** `gemini-3-flash-preview` (Text), `gemini-2.5-flash-image` (Image Gen)
*   **Markdown:** `react-markdown` + `remark-gfm`

---

## 🚀 Getting Started

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/yourusername/noteverse-canvas.git
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set Environment Variables**
    Create a `.env` file and add your Google Gemini API Key:
    ```env
    API_KEY=your_gemini_api_key_here
    ```

4.  **Run Development Server**
    ```bash
    npm start
    ```

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
| **Save/Load** | `Ctrl + S` / Toolbar Menu |

---

## 🤝 Community & Roadmap

NoteVerse is an evolving experiment in spatial computing and AI. We believe the best tools are built by the people who use them.

We are actively looking for contributors! Do you have an idea for:
*   Real-time collaboration?
*   Vector-based semantic search?
*   Custom node types (Kanban, Code Blocks)?

**Fork the repo, submit a PR, or open an issue.** Let's build the future of note-taking together.

---

**NoteVerse Canvas** — *Where ideas find their place.*