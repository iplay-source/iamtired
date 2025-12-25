
# iamtired 🌌

**iamtired** is an infinite spatial knowledge engine. It combines a whiteboard interface with a structured document editor, powered by Generative AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![AI](https://img.shields.io/badge/AI-Powered-8e75ff.svg)

---

## Features

### 🎨 Infinite Canvas
*   **Boundless Workspace:** Pan and zoom infinitely to organize thoughts spatially.
*   **Adaptive Grid:** Visual grid that scales with zoom levels; includes snap-to-grid functionality.
*   **Theme Engine:** Seamless Light and Dark mode support with glassmorphism UI.
*   **Navigation:** Intuitive panning (`Space + Drag`) and zooming (`Ctrl + Scroll`).

### 📝 Rich Content Nodes
*   **Markdown Editor:** Full WYSIWYG experience supporting headers, lists, bold, italic, and quotes.
*   **Image Nodes:** Drag-and-drop upload, URL embedding, and AI generation.
*   **Customization:** Resizable nodes, custom fonts (Sans, Serif, Mono), and image fitting (Cover/Contain) with positioning.
*   **Focus Mode:** Double-click a node to isolate and edit content without distractions.

### 🔗 Visual Connectivity
*   **Connection Lines:** Draw relationships between any two nodes.
*   **Labeled Edges:** Add semantic labels to connections (e.g., "causes", "relates to").
*   **Smart Interaction:** Edit labels inline; text selection is preserved while panning/dragging.

### 🤖 AI Intelligence
*   **Multi-Provider Support:** Seamlessly switch between Google Gemini, OpenAI, Anthropic Claude, OpenRouter, and Local LLMs (Ollama).
*   **Context-Aware Branching:** Create new nodes linked to existing ones; the AI reads the parent context to generate relevant continuations.
*   **Text Expansion:** Turn short notes into full articles.
*   **Semantic Editing:** Refine text with natural language instructions (e.g., "Fix grammar", "Make concise").
*   **Media Generation:** Generate images for nodes using supported AI models.
*   **Grounded Search:** Find reference images via Google Search (supported providers only).

### 💾 Data & System
*   **Local-First:** Data is auto-saved to browser Local Storage.
*   **Portable:** Export and Import your graph as JSON.
*   **Privacy:** API Keys are stored locally in the browser; no external database.

---

## 🛠️ Tech Stack

*   **Framework:** React 19
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **AI Integration:** Google GenAI SDK & Standard REST APIs
*   **Markdown:** `react-markdown` / `remark-gfm`

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
    Open the app and click the **Settings** icon to configure your preferred AI provider (Gemini, OpenAI, Claude, Local, etc.).

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
