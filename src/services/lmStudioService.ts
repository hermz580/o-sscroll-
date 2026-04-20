
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{
    type: "text" | "image_url";
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

export async function lmStudioChatCompletion(
  messages: ChatMessage[],
  endpoint: string = "http://localhost:1234/v1"
) {
  const response = await fetch(`${endpoint}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "model-identifier",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`LM Studio error: ${response.statusText}`);
  }

  const json = await response.json();
  return json.choices[0].message.content;
}

export async function generateReadingLMStudio(
  prompt: string,
  systemInstruction: string,
  images?: any[],
  endpoint: string = "http://localhost:1234/v1"
) {
  const userContent: any[] = [{ type: "text", text: prompt + "\n\nRespond in JSON format as specified." }];

  if (images && images.length > 0) {
    images.forEach(img => {
      let url = "";
      if (img.inlineData) {
        url = `data:${img.inlineData.mimeType};base64,${img.inlineData.data}`;
      } else if (typeof img === 'string') {
        url = img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`;
      }

      if (url) {
        userContent.push({
          type: "image_url",
          image_url: { url }
        });
      }
    });
  }

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: systemInstruction + "\n\nIMPORTANT: You MUST respond with ONLY a valid JSON object matching the requested schema. Do not include any markdown formatting, preamble, or postamble. Your entire response must be a single JSON object."
    },
    {
      role: "user",
      content: userContent.length === 1 ? (userContent[0] as any).text : userContent
    }
  ];

  return lmStudioChatCompletion(messages, endpoint);
}
