import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateArticleContent = async (title: string, parentContext?: string | { title: string, content: string }): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  let contextPrompt = "";
  
  if (parentContext) {
    if (typeof parentContext === 'string') {
        // Legacy/Simple string context
        contextPrompt = `The user is branching out from an existing topic: "${parentContext}". Use this as context to ensure the new article is relevant to the parent topic.`;
    } else {
        // Rich context with content
        contextPrompt = `
        The user is branching out from the article "${parentContext.title}".
        
        Parent Article Content (for context):
        """
        ${parentContext.content.slice(0, 3000)}
        """
        
        Use the parent article content above to understand the context of "${title}" better. Ensure the new article connects logically to the parent article's content.
        `;
    }
  }

  const prompt = `
    ${contextPrompt}

    Write a concise, informative encyclopedia entry for the topic: "${title}".
    Write in clean Markdown format.
    Do not include the main # Title header.
    Use **bold** for key terms.
    Keep it approx 150-200 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || "Could not generate content.";
  } catch (error) {
    console.error("Gemini generation error:", error);
    return "Error generating content. Please check your API key.";
  }
};

export const suggestConnection = async (nodeA: string, nodeB: string): Promise<string> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Briefly explain the connection between "${nodeA}" and "${nodeB}" in one short sentence (max 10 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text?.trim() || "Related";
  } catch (error) {
    return "Connected";
  }
};

export const expandStub = async (title: string, currentContent: string, userInstruction?: string): Promise<string> => {
    const model = "gemini-3-flash-preview";
    const instruction = userInstruction ? `Focus specifically on: ${userInstruction}` : "Write a more comprehensive version.";
    
    const prompt = `
      Expand the article for "${title}".
      ${instruction}
      
      Current content (Markdown):
      ${currentContent}

      Return strictly Markdown body content.
    `;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      return response.text || currentContent;
    } catch (error) {
      console.error(error);
      return currentContent;
    }
};

export const refineContent = async (content: string, instruction: string): Promise<string> => {
  const model = "gemini-3-flash-preview";
  const prompt = `
    Rewrite the following Markdown content based on this instruction: "${instruction}".
    Maintain the original meaning but change the tone, style, or structure as requested.
    Return strictly Markdown body content.

    Current Content:
    ${content}
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text || content;
  } catch (error) {
    console.error(error);
    return content;
  }
};

export const generateImageForArticle = async (title: string): Promise<string | null> => {
  const model = "gemini-2.5-flash-image";
  const prompt = `A clean, illustrative, educational image for: "${title}". Minimalist style.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};

export const searchImageForArticle = async (title: string): Promise<string | null> => {
  const model = "gemini-3-flash-preview";
  const prompt = `Find a direct URL to a public domain image representing "${title}". Return ONLY the URL.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    const text = response.text?.trim();
    if (!text) return null;
    const match = text.match(/(https?:\/\/[^\s"'>]+)/);
    return match ? match[0] : null;
  } catch (error) {
    console.error("Image search error:", error);
    return null;
  }
};