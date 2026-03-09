/**
 * getChatStream para LM Studio Nativo (/api/v1/chat)
 */
export const getChatStream = async (
  prompt: string,
  onUpdate: (content: string, reasoning: string) => void,
  signal: AbortSignal,
  responseId?: string,
  thinking: boolean = false
): Promise<{ content: string; reasoning: string; responseId?: string }> => {

  let fullContent = "";
  let fullReasoning = "";
  let isReasoning = false;
  let finalResponseId = responseId;

  const response = await fetch("http://localhost:1234/api/v1/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: prompt,
      stream: true,
      temperature: 1,
      model: "qwen/qwen3.5-9b",
      top_p: 0.95,
      top_k: 20,
      repeat_penalty: 1,
      min_p: 0,
      reasoning: thinking ? "on": "off",
      previous_response_id: responseId
    }),
    signal
  });

  if (!response.body) throw new Error("No body");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let leftover = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = leftover + decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    leftover = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      
      // 1. Manejo de eventos de control (Keep-alive o marcadores de estado)
      if (!trimmed) continue;
      if (trimmed === "event: reasoning.start") { 
        isReasoning = true; 
        continue; 
      }
      if (trimmed === "event: reasoning.end" || trimmed === "event: content.start") { 
        isReasoning = false; 
        continue; 
      }

      // 2. Procesamiento de datos
      if (trimmed.startsWith("data: ")) {
        const jsonStr = trimmed.substring(6); // Más seguro que replace para JSONs largos
        if (jsonStr === "[DONE]") break;

        try {
          const data = JSON.parse(jsonStr);

          // Capturamos el ID final
          if (data.type === "chat.end") {
            finalResponseId = data.result?.response_id;
            continue;
          }

          // --- LA CLAVE ESTÁ AQUÍ ---
          // Forzamos el estado basado en el 'type' del objeto de datos
          if (data.type === "reasoning.delta") {
            isReasoning = true;
          } else if (data.type === "content.delta" || data.type === "message.delta") {
            isReasoning = false;
          }

          const text = data.content || "";
          
          if (isReasoning) {
            fullReasoning += text;
          } else {
            fullContent += text;
          }

          // Notificamos a la UI con los acumuladores separados
          onUpdate(fullContent, fullReasoning);

        } catch (e) { 
          // Si el JSON está incompleto, el 'leftover' se encargará en la siguiente iteración
          continue; 
        }
      }
    }
  }

  return { content: fullContent, reasoning: fullReasoning, responseId: finalResponseId };
};

export default getChatStream;