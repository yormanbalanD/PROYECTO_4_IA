import { db } from "../db";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "./ui/button";
import { PlusCircle, MessageSquare, Trash2 } from "lucide-react";

export function Aside({ currentSessionId, onSelectSession }: any) {
  // Obtenemos todas las sesiones ordenadas por la más reciente
  const sessions = useLiveQuery(() => db.sessions.orderBy("updatedAt").reverse().toArray()) || [];

  const createNewChat = () => {
    onSelectSession(null); // Esto limpia la pantalla para un nuevo chat
  };

  const deleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Eliminar este chat?")) {
      await db.sessions.delete(id);
      await db.messages.where("sessionId").equals(id).delete();
      if (currentSessionId === id) onSelectSession(null);
    }
  };

  return (
    <aside className="w-64 border-r bg-card flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={createNewChat} className="w-full gap-2">
          <PlusCircle className="h-4 w-4" /> Nuevo Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {sessions.map((s) => (
          <div
            key={s.id}
            onClick={() => onSelectSession(s.id)}
            className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
              currentSessionId === s.id ? "bg-accent" : "hover:bg-accent/50"
            }`}
          >
            <MessageSquare className="h-4 w-4 shrink-0 opacity-50" />
            <span className="flex-1 text-xs truncate font-medium">{s.title}</span>
            <Trash2 
              onClick={(e) => deleteSession(s.id!, e)}
              className="h-3 w-3 opacity-0 group-hover:opacity-100 text-destructive transition-opacity" 
            />
          </div>
        ))}
      </div>
    </aside>
  );
}