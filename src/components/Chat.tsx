import { SendHorizontal, BrainCircuit, Loader2, Square } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useState } from "react";
import { cn } from "../lib/utils";

interface ChatProps {
  onSendMessage: (message: string) => void;
  onStopGeneration: () => void; // <--- Nueva prop para detener
  isLoading: boolean;
  thinking: boolean;
  setThinking: (val: boolean) => void;
}

export function Chat({ onSendMessage, onStopGeneration, isLoading, thinking, setThinking }: ChatProps) {
  const [input, setInput] = useState("");

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
    <div className="border-t bg-background p-4 space-y-3">
      <div className="mx-auto max-w-3xl flex justify-end items-center gap-2 px-1">
        <Label htmlFor="think-mode" className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
          <BrainCircuit className="h-4 w-4" /> Razonamiento
        </Label>
        <Switch 
          id="think-mode" 
          checked={thinking} 
          onCheckedChange={setThinking} 
        />
      </div>

      <div className="mx-auto max-w-3xl relative flex items-end gap-2">
        <div className="relative flex-1">
          <Textarea
            placeholder={isLoading ? "Generando respuesta..." : "Escribe al chatbot..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && !isLoading && (e.preventDefault(), handleAction())}
            // Eliminamos el disabled para permitir escribir mientras piensa, o puedes dejarlo si prefieres
            className="min-h-[44px] max-h-40 w-full resize-none bg-muted/50 pr-12 py-3 focus-visible:ring-1"
            rows={1}
          />
          <Button 
            size="icon" 
            className={cn(
              "absolute right-1.5 bottom-1.5 h-8 w-8 transition-all",
              isLoading ? "bg-destructive hover:bg-destructive/90" : ""
            )}
            // Solo deshabilitado si no hay texto Y no está cargando
            disabled={!input.trim() && !isLoading}
            onClick={handleAction}
          >
            {isLoading ? (
              <div className="relative flex items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
                <Square className="h-2 w-2 fill-current absolute" /> 
              </div>
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}