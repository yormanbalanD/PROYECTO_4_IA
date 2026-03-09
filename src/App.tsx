import { useState } from "react";
import { Aside } from "./components/Aside";
import { Mensajes } from "./components/Mensajes";
import { Chat } from "./components/Chat";
import getChatStream from "./lib/api";
import { db } from "./db";
import { useLiveQuery } from "dexie-react-hooks";

function App() {
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState(true); // Cambiado a false por defecto
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const messages = useLiveQuery(
    () => currentSessionId
      ? db.messages.where("sessionId").equals(currentSessionId).sortBy("timestamp")
      : Promise.resolve([]),
    [currentSessionId]
  ) || [];

  const handleStop = () => {
    abortController?.abort();
  };

const handleSendMessage = async (userInput: string) => {
  if (!userInput.trim() || loading) return;

  const controller = new AbortController();
  setAbortController(controller);
  setLoading(true);

  try {
    let sessionId = currentSessionId;

    // 1. Asegurar la sesión primero
    if (!sessionId) {
      sessionId = await db.sessions.add({
        title: userInput.substring(0, 30) + "...",
        updatedAt: Date.now()
      }) as number;
      setCurrentSessionId(sessionId);
    }

    // 2. GUARDAR MENSAJE DEL USUARIO (Importante usar await aquí)
    await db.messages.add({
      sessionId,
      role: "user",
      content: userInput,
      timestamp: Date.now()
    });

    // 3. Obtener la sesión actualizada para el responseId (contexto)
    const session = await db.sessions.get(sessionId);

    // 4. Crear el placeholder del asistente
    const botMsgId = await db.messages.add({
      sessionId,
      role: "assistant",
      content: "",
      reasoning: "",
      timestamp: Date.now() + 1 // +1 para asegurar el orden cronológico
    }) as number;

    // 5. Iniciar el stream
    const result = await getChatStream(
      userInput, 
      (content, reasoning) => {
        // Actualización en tiempo real en Dexie
        db.messages.update(botMsgId, { content, reasoning });
      },
      controller.signal,
      session?.lastResponseId,
      thinking
    );

    // 6. Al terminar, actualizar la sesión con el nuevo context_id
    if (result.responseId) {
      await db.sessions.update(sessionId, { 
        lastResponseId: result.responseId,
        updatedAt: Date.now()
      });
    }

  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Generación detenida');
    } else {
      console.error("Error al enviar mensaje:", error);
    }
  } finally {
    setLoading(false);
    setAbortController(null);
  }
};

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Aside
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
      />

      <main className="flex flex-1 flex-col h-screen min-w-0">
        <header className="border-b p-4 shrink-0 bg-card flex justify-between items-center">
          <h1 className="text-sm font-bold opacity-70">FmoWinConf Assistant</h1>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded">
            LM Studio Native API
          </span>
        </header>

        <div className="flex-1 min-h-0 relative">
          <Mensajes
            messages={messages}
            thinking={loading} // Usamos loading para el estado visual de "procesando"
            raw={false}
          />
        </div>

        <div className="shrink-0">
          <Chat
            onStopGeneration={handleStop}
            onSendMessage={handleSendMessage}
            isLoading={loading}
            thinking={thinking}
            setThinking={setThinking}
          />
        </div>
      </main>
    </div>
  );
}

export default App;