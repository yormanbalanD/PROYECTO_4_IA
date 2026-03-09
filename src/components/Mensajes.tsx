import { useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { cn } from "../lib/utils";
import { BrainCircuit } from "lucide-react";

interface MensajesProps {
  messages: any[];
  thinking: boolean;
  raw?: boolean;
}

// Sub-componente para la animación de carga
const ThinkingLoader = () => (
  <div className="flex items-center gap-2 text-muted-foreground italic">
    <span>Analizando pregunta</span>
    <span className="flex gap-1">
      <span className="animate-bounce [animation-delay:-0.3s]">.</span>
      <span className="animate-bounce [animation-delay:-0.15s]">.</span>
      <span className="animate-bounce">.</span>
    </span>
  </div>
);

export function Mensajes({ messages, thinking, raw = false }: MensajesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "auto",
      });
    }
  }, [messages, thinking]);

  return (
    <ScrollArea ref={scrollRef} className="h-full w-full">
      <div className="mx-auto max-w-3xl p-4 space-y-6">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === "assistant" || msg.role === "system";
          const isUser = msg.role === "user";
          const isLast = index === messages.length - 1;

          return (
            <div
              key={msg.id || `msg-${index}`}
              className={cn(
                "flex items-start gap-3 w-full",
                isUser ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Avatar className="h-8 w-8 border shrink-0">
                <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted text-xs"}>
                  {isUser ? "YO" : "AI"}
                </AvatarFallback>
              </Avatar>

              <div className={cn(
                "flex flex-col gap-2 min-w-0 max-w-[85%]",
                isUser ? "items-end" : "items-start"
              )}>

                {/* 1. RAZONAMIENTO */}
                {!raw && isAssistant && msg.reasoning && (
                  <Accordion
                    type="single"
                    collapsible
                    defaultValue={isLast ? "thought" : undefined}
                    className="w-full bg-muted/30 rounded-lg px-3 border"
                  >
                    <AccordionItem value="thought" className="border-none">
                      <AccordionTrigger className="py-2 text-xs text-muted-foreground hover:no-underline">
                        <span className="flex items-center gap-2">
                          <BrainCircuit className={cn("h-3 w-3", isLast && thinking && !msg.content && "animate-pulse text-primary")} />
                          Razonamiento
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-xs text-muted-foreground italic leading-relaxed whitespace-pre-wrap overflow-visible h-auto">
                        {msg.reasoning}
                        {isLast && thinking && !msg.content && (
                          <span className="inline-block w-1 h-3 ml-1 bg-primary animate-pulse" />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}

                {/* 2. BURBUJA DE TEXTO */}
                <div className={cn(
                  "rounded-2xl px-4 py-3 shadow-sm text-sm break-words",
                  isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {/* Lógica para mostrar "Analizando..." solo si no hay contenido aún */}
                      {isLast && thinking && !msg.content ? (
                        <ThinkingLoader />
                      ) : (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  className="rounded-md my-2"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={cn("bg-black/10 rounded px-1", className)} {...props}>
                                  {children}
                                </code>
                              );
                            },
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div className="h-8" />
      </div>
    </ScrollArea>
  );
}