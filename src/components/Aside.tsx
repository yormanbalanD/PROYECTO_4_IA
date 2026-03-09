import { db } from "../db";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "./ui/button";
import { PlusCircle, MessageSquare, Trash2, ChefHat } from "lucide-react";
import { personalidades } from "../lib/api";
import { cn } from "../lib/utils";

interface AsideProps {
  currentSessionId: number | null;
  onSelectSession: (id: number | null) => void;
}

export function Aside({ currentSessionId, onSelectSession }: AsideProps) {
  const sessions = useLiveQuery(() =>
    db.sessions.orderBy("updatedAt").reverse().toArray()
  ) || [];

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const getChefSolidBg = (label?: string) => {
    if (!label) return "bg-[#cdcdcd] text-slate-800"; // Gris base con texto oscuro
    if (label.includes("Judas")) return "bg-[#4c1d95] text-white";
    if (label.includes("Kotori")) return "bg-[#dc2626] text-white";
    if (label.includes("Jeremias")) return "bg-[#e2e8f0] text-slate-900";
    return "bg-[#cdcdcd] text-slate-800";
  };

  const createNewChat = () => onSelectSession(null);

  const deleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Eliminar este chat?")) {
      await db.transaction('rw', [db.sessions, db.messages], async () => {
        await db.messages.where("sessionId").equals(id).delete();
        await db.sessions.delete(id);
      });
      if (currentSessionId === id) onSelectSession(null);
    }
  };

  return (
    <aside className={cn(
      "w-64 flex flex-col h-full overflow-hidden transition-all duration-500 ease-in-out",
      currentSession?.chefLabel ? getChefSolidBg(currentSession?.chefLabel) : "bg-[#cdcdcd]"
    )}>
      {/* Botón Nuevo Chat Adaptable */}
      <div className="p-4 border-b border-current/10 shrink-0">
        <Button
          onClick={createNewChat}
          variant="outline"
          className={cn(
            "w-full gap-2 border-2 border-dashed transition-all duration-300",
            currentSession?.chefLabel == personalidades[0].label || currentSession?.chefLabel == undefined
              ? "bg-black/5 border-black/20 text-slate-700 hover:bg-black/10 hover:border-black/40 shadow-sm" : "bg-white/15 border-white/40 text-white hover:bg-white/25 hover:border-white/60"

          )}
        >
          <PlusCircle className="h-4 w-4 stroke-[3px]" />
          <span className="font-black uppercase tracking-tight text-[11px]">Nuevo Chat</span>
        </Button>
      </div>

      {/* Lista de Sesiones */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {sessions.map((s) => {
          const isSelected = currentSessionId === s.id;
          const chefConfig = personalidades.find(p => p.label === s.chefLabel);
          const chefStyle = getChefSolidBg(s.chefLabel);

          return (
            <div
              key={s.id}
              onClick={() => onSelectSession(s.id!)}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300",
                isSelected
                  ? "bg-white/30 shadow-md text-current ring-1 ring-white/40"
                  : "text-current/70 hover:text-current hover:bg-black/5"
              )}
            >
              {/* Icono del Chef */}
              <div className={cn(
                "shrink-0 transition-transform duration-300",
                isSelected ? "scale-110 opacity-100" : "opacity-60"
              )}>
                {chefConfig?.icon || <MessageSquare className="h-5 w-5" />}
              </div>

              {/* Título Dinámico: Prioriza el prompt guardado */}
              <div className="flex flex-col flex-1 min-w-0">
                <span className={cn(
                  "text-[11px] truncate uppercase tracking-wider leading-tight",
                  isSelected ? "font-black" : "font-bold"
                )}>
                  {/* Si s.title existe (el prompt), lo muestra. Si no, muestra el chef */}
                  {s.title || (s.chefLabel ? `Chat con ${s.chefLabel.split('(')[0]}` : "Nueva Sesión")}
                </span>

                {/* Subtítulo opcional para saber con quién hablas si el título cambió */}
                {s.title && (
                  <span className="text-[9px] opacity-50 font-medium uppercase tracking-tighter">
                    Chef: {s.chefLabel?.split('(')[0]}
                  </span>
                )}
              </div>

              {/* Botón Eliminar */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 opacity-0 group-hover:opacity-100 transition-all",
                  isSelected ? "hover:bg-black/20" : "hover:bg-destructive/20 hover:text-destructive"
                )}
                onClick={(e) => deleteSession(s.id!, e)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-current/10 bg-black/5 flex items-center justify-center gap-2">
        <ChefHat className="h-3 w-3 opacity-50" />
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
          Cocineros 3000 v1.0
        </p>
      </div>
    </aside>
  );
}