import { useState } from "react";
import {
  SendHorizontal,
  BrainCircuit,
  Loader2,
  Square,
  Lock
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { cn } from "../lib/utils";
import { personalidades } from "../lib/api";

interface ChatProps {
  onSendMessage: (message: string) => void;
  onStopGeneration: () => void;
  isLoading: boolean;
  thinking: boolean;
  setThinking: (val: boolean) => void;
  selectedChefLabel?: string; // Opcional para evitar errores de carga inicial
}

export function Chat({
  onSendMessage,
  onStopGeneration,
  isLoading,
  thinking,
  setThinking,
  selectedChefLabel
}: ChatProps) {
  const [input, setInput] = useState("");

  // --- Lógica de Seguridad para el renderizado ---

  // 1. Si no hay label, no renderizamos el componente para evitar errores de split
  if (!selectedChefLabel) return null;

  // 2. Buscamos la info del chef basada en el label de la DB
  const chefInfo = personalidades.find(p => p.label === selectedChefLabel);

  // 3. Obtenemos el nombre corto (antes del paréntesis) de forma segura
  const chefName = selectedChefLabel.split('(')[0]?.trim() || "Cocinero";

  const handleAction = () => {
    if (isLoading) {
      onStopGeneration();
    } else {
      if (!input.trim()) return;
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="border-t p-4 space-y-3 bg-[#cdcdcd]">
      <div className="mx-auto max-w-3xl flex justify-between items-center px-1">
        {/* Indicador de Personalidad Bloqueada */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border text-[10px] font-bold uppercase text-muted-foreground animate-in fade-in slide-in-from-left-2">
          {chefInfo?.icon && <span className="scale-75 text-primary">{chefInfo.icon}</span>}
          <span>{chefName}</span>
          <Lock className="h-3 w-3 opacity-90" />
        </div>

        {/* Switch de Razonamiento */}
        <div className="flex items-center gap-2">
          <Label
            htmlFor="think-mode"
            className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 cursor-pointer"
          >
            <BrainCircuit className={cn("h-4 w-4 text-primary", thinking && "text-yellow-200")} /> Razonamiento
          </Label>
          <Switch
            id="think-mode"
            checked={thinking}
            onCheckedChange={setThinking}
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl relative flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            placeholder={isLoading ? "El chef está preparando una respuesta..." : `Escribe a ${chefName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                e.preventDefault();
                handleAction();
              }
            }}
            className="min-h-[44px] max-h-40 w-full resize-none bg-muted/30 pr-12 py-3 focus-visible:ring-1 border-muted-foreground/20"
            rows={1}
          />
          <Button
  size="icon"
  className={cn(
    "absolute right-1.5 bottom-1.5 h-8 w-8 overflow-hidden transition-all duration-300 shadow-lg group",
    isLoading
      ? "bg-destructive text-destructive-foreground"
      : selectedChefLabel.includes("Jeremias")
        ? "bg-slate-800 text-white hover:bg-slate-900"
        : "bg-white text-slate-900 hover:bg-white/90"
  )}
  disabled={!input.trim() && !isLoading}
  onClick={handleAction}
>
  <div className="relative h-4 w-4 flex items-center justify-center">
    {isLoading ? (
      <>
        {/* Icono de Carga: Se desvanece y se achica al hacer hover */}
        <Loader2 
          className="absolute h-4 w-4 animate-spin transition-all duration-300 opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-50" 
        />
        {/* Icono Cuadrado: Aparece desde la transparencia y crece al hacer hover */}
        <Square 
          className="absolute h-4 w-4 transition-all duration-300 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 fill-current" 
        />
      </>
    ) : (
      <SendHorizontal className="h-4 w-4 transition-transform duration-300" />
    )}
  </div>
</Button>
        </div>
      </div>
    </div>
  );
}