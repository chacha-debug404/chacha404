import { GoogleGenAI } from "@google/genai";

async function processImage() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        text: "Please remove the background from the attached image and return ONLY the base64 string of the resulting image (with transparent background). Do not include any other text or markdown formatting.",
      },
      // The image is in the context, so the model should be able to see it.
    ],
  });
  console.log(response.text);
}

processImage();
