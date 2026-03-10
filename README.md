# **Local LLM Chat Interface & Persistence**

Una interfaz de chat moderna y profesional diseñada para interactuar con modelos de lenguaje locales ejecutados en **LM Studio**. A diferencia de las interfaces convencionales, este proyecto implementa una arquitectura de persistencia robusta y una comunicación optimizada mediante WebSockets.

## **🚀 Características Principales**

* **Integración Nativa con LM Studio SDK:** Utiliza @lmstudio/sdk para una comunicación bidireccional vía WebSockets, permitiendo un streaming de tokens más fluido y control total sobre los parámetros del modelo.  
* **Persistencia con IndexedDB:** Implementación de **Dexie.js** para el almacenamiento local. Esto permite guardar gigabytes de historial de chat directamente en el navegador, superando el límite de 5MB de localStorage.  
* **Gestión Multi-sesión:** Sistema relacional que permite crear múltiples hilos de conversación, navegar por el historial y retomar sesiones anteriores.  
* **Filtrado de Pensamiento (CoT):** Lógica avanzada para procesar y visualizar (u ocultar) etiquetas \<think\> provenientes de modelos de razonamiento como DeepSeek-R1 o Qwen-2.5-Coder.  
* **Arquitectura Reactiva:** Sincronización automática de la interfaz de usuario con la base de datos mediante Hooks reactivos (useLiveQuery).

## **🛠️ Stack Tecnológico**

* **Frontend:** [React](https://react.dev/) \+ [Vite](https://vitejs.dev/)  
* **Estado y Persistencia:** [Dexie.js](https://dexie.org/) (IndexedDB)
* **Componentes UI:** [Tailwind CSS](https://tailwindcss.com/) \+ [shadcn/ui](https://ui.shadcn.com/)  
* **Iconografía:** [Lucide React](https://lucide.dev/)

## **📋 Requisitos Previos**

1. **LM Studio:** Debe estar instalado y en ejecución.  
2. **Node:** Para ejecutar el proyecto se debe tener NodeJS instalado en la maquina
3. **Servidor Local:** \* Activar el servidor en el puerto 1234\.  
   * **IMPORTANTE:** Habilitar **CORS** (Cross-Origin Resource Sharing) en la configuración del servidor de LM Studio para permitir peticiones desde el navegador.  
4. **Modelo:** Tener al menos un modelo cargado en la memoria de LM Studio.

## **🔧 Instalación**

1. Clonar el repositorio:  
   git clone \[https://github.com/yormanbalanD/PROYECTO_4_IA.git\](https://github.com/yormanbalanD/PROYECTO_4_IA.git)  
   cd chatbot

2. Instalar dependencias:  
   npm install

3. Iniciar servidor de desarrollo:  
   npm dev

4. Ten en cuenta que el servidor del LLM se debe de encontrar en ws://localhost:1234

## **🏗️ Estructura de Datos (IndexedDB)**

El proyecto utiliza un esquema relacional dentro de IndexedDB para manejar el historial:  
// Esquema de Dexie  
db.version(1).stores({  
  sessions: '++id, updatedAt',        // Tabla de conversaciones  
  messages: '++id, sessionId, timestamp' // Tabla de mensajes vinculados  
});

## **⚠️ Notas Técnicas de Entorno**

Debido a que el SDK oficial de LM Studio busca variables de entorno de Node.js (process.env), se ha incluido un parche de compatibilidad en la configuración de Vite para prevenir errores en el entorno del navegador:  
// vite.config.ts  
export default defineConfig({  
  define: {  
    'process.env': {  
      LMS\_NO\_FANCY\_ERRORS: 'true'  
    }  
  }  
})

## **📄 Licencia**

Este proyecto se distribuye bajo la licencia MIT.