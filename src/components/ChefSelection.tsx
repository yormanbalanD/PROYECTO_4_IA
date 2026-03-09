import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { personalidades } from "../lib/api";
import { cn } from "../lib/utils";

export function ChefSelection({ onSelect }: { onSelect: (label: string) => void }) {
  
  const getGradientClass = (label: string) => {
    if (label.includes("Judas")) {
      return "from-[#0f172a] via-[#4c1d95] to-[#1e3a8a] text-white border-indigo-500/30";
    }
    if (label.includes("Kotori")) {
      return "from-[#991b1b] via-[#f97316] to-[#dc2626] text-white border-orange-500/30";
    }
    if (label.includes("Jeremias")) {
      return "from-[#f8fafc] via-[#cbd5e1] to-[#f8fafc] text-slate-900 border-slate-300";
    }
    return "bg-card";
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black tracking-tighter uppercase italic italic">
          Elige tu Mentor
        </h2>
        <p className="text-muted-foreground font-medium">
          La personalidad elegida marcará el destino de tus recetas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {personalidades.map((chef) => (
          <Card 
            key={chef.label} 
            className={cn(
              "relative overflow-hidden cursor-pointer border-2 bg-gradient-to-r animate-gradient-hover group",
              getGradientClass(chef.label)
            )}
            onClick={() => onSelect(chef.label)}
          >
            {/* El escalado ahora es suave gracias al CSS anterior aplicado a .animate-gradient-hover */}
            <CardHeader className="text-center relative z-10 pt-8">
              <div className={cn(
                "mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-700 group-hover:rotate-[360deg]",
                chef.label.includes("Jeremias") ? "bg-black/5" : "bg-white/10 backdrop-blur-md"
              )}>
                <div className="scale-[1.8]">
                  {chef.icon}
                </div>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight uppercase">
                {chef.label.split('(')[0]}
              </CardTitle>
              <CardDescription className={cn(
                "font-bold uppercase tracking-[0.2em] text-[10px] mt-1",
                chef.label.includes("Jeremias") ? "text-slate-500" : "text-white/70"
              )}>
                {chef.label.match(/\(([^)]+)\)/)?.[1] || ""}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center relative z-10 pb-10 px-8">
              <p className={cn(
                "text-sm font-medium leading-relaxed italic",
                chef.label.includes("Jeremias") ? "text-slate-600" : "text-white/80"
              )}>
                {chef.label.includes("Jeremias") && "“La cocina es ciencia, amor y muchas papas fritas.”"}
                {chef.label.includes("Kotori") && "“La mediocridad es el ingrediente que más detesto.”"}
                {chef.label.includes("Judas") && "“Cocina rápido, quiero que te vayas pronto.”"}
              </p>
            </CardContent>

            {/* Brillo dinámico en hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </Card>
        ))}
      </div>
    </div>
  );
}