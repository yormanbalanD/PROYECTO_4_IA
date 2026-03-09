import { useState } from "react";
import { Aside } from "./components/Aside";
import { Mensajes } from "./components/Mensajes";
import { Chat } from "./components/Chat";
import getChatStream, { personalidades } from "./lib/api";
import { db } from "./db";
import { useLiveQuery } from "dexie-react-hooks";
import { ChefHat } from "lucide-react";
import { ChefSelection } from "./components/ChefSelection";
import { cn } from "./lib/utils";

export const getChefSolidBg = (label?: string) => {
  if (!label) return "bg-card text-foreground";
  if (label.includes("Judas")) return "bg-[#4c1d95] text-white"; // Morado sólido
  if (label.includes("Kotori")) return "bg-[#dc2626] text-white"; // Rojo sólido
  if (label.includes("Jeremias")) return "bg-[#e2e8f0] text-slate-900"; // Gris claro sólido
  return "bg-card text-foreground";
};

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

  const currentSession = useLiveQuery(
    () => currentSessionId ? db.sessions.get(currentSessionId) : Promise.resolve(null),
    [currentSessionId]
  );

  // 2. Modificar handleSendMessage para que use el chef de la sesión
  const handleSendMessage = async (userInput: string) => {
    if (!currentSessionId) return;

    // Si es el primer mensaje, generamos un título corto basado en el prompt
    if (messages.length === 0) {
      // Tomamos las primeras palabras (ej. 4 palabras) para el título
      const generatedTitle = userInput.split(' ').slice(0, 4).join(' ') + "...";

      await db.sessions.update(currentSessionId, {
        title: generatedTitle,
        updatedAt: new Date()
      });
    }

    if (!userInput.trim() || loading || !currentSession?.chefLabel) return;

    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);

    try {
      const sessionId = currentSessionId!;

      // Obtener el contenido del prompt basado en el label guardado
      const chefConfig = personalidades.find(p => p.label === currentSession.chefLabel);

      await db.messages.add({
        sessionId,
        role: "user",
        content: userInput,
        timestamp: Date.now()
      });

      const botMsgId = await db.messages.add({
        sessionId,
        role: "assistant",
        content: "",
        reasoning: "",
        timestamp: Date.now() + 1
      }) as number;

      const result = await getChatStream(
        userInput,
        (content, reasoning) => {
          db.messages.update(botMsgId, { content, reasoning });
        },
        controller.signal,
        currentSession.lastResponseId,
        thinking,
        chefConfig?.content // Enviamos el prompt del chef guardado
      );

      if (result.responseId) {
        await db.sessions.update(sessionId, {
          lastResponseId: result.responseId,
          updatedAt: Date.now()
        });
      }
    } catch (error: any) {
      // ... manejo de errores
    } finally {
      setLoading(false);
    }
  };

  // 3. Nueva función para inicializar la sesión con un Chef
  const handleStartChatWithChef = async (chefLabel: string) => {
    const sessionId = await db.sessions.add({
      title: `Cocina con ${chefLabel.split(' ')[0]}`,
      updatedAt: Date.now(),
      chefLabel: chefLabel // Guardamos la elección permanentemente
    }) as number;
    setCurrentSessionId(sessionId);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Aside
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
      />

      <main className="flex flex-1 flex-col h-screen min-w-0 bg-[#cdcdcd]">
        <header className={cn(
          "border-b p-4 shrink-0 flex justify-between items-center transition-all duration-500",
          currentSession?.chefLabel ? getChefSolidBg(currentSession?.chefLabel) : "bg-[#cdcdcd]"
        )}>
          <h1 className="text-sm font-bold flex items-center gap-2">
            {currentSession?.chefLabel ? (
              <>
                <span className="p-1.5 bg-white/20 rounded-lg">
                  {personalidades.find(p => p.label === currentSession.chefLabel)?.icon || <ChefHat className="h-4 w-4" />}
                </span>
                Cocinando con {currentSession.chefLabel.split('(')[0]}
              </>
            ) : (
              <>
                <ChefHat className="w-8 h-8 opacity-70" />
                <span className="opacity-70 text-foreground">Asistente De Cocina</span>
              </>
            )}
          </h1>

          <div className="flex items-center gap-3">
            <span className={cn(
              "text-[12px] px-3 py-1 rounded-full font-bold border backdrop-blur-md transition-all duration-500",
              currentSession?.chefLabel ? "bg-white/20 border-white/30" : "bg-primary/10 text-primary border-primary/20"
            )}>
              LM Studio Native API
            </span>
          </div>
        </header>

        <div className="flex-1 min-h-0 relative">
          {/* Caso 1: No hay sesión seleccionada O la sesión seleccionada no tiene chef aún */}
          {(!currentSessionId || (currentSessionId && currentSession && !currentSession.chefLabel)) ? (
            <ChefSelection onSelect={handleStartChatWithChef} />
          ) : (
            // Caso 2: Hay sesión y tiene chef, mostramos mensajes
            <Mensajes
              messages={messages}
              thinking={loading}
              raw={false}
            />
          )}
        </div>

        {/* En App.tsx */}
        {currentSession?.chefLabel && (
          <div className="shrink-0">
            <Chat
              selectedChefLabel={currentSession.chefLabel} // <--- Ahora es seguro
              onStopGeneration={handleStop}
              onSendMessage={handleSendMessage}
              isLoading={loading}
              thinking={thinking}
              setThinking={setThinking}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;