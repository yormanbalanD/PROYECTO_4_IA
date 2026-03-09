import Dexie, { type EntityTable } from 'dexie';

// En tu archivo de base de datos
export interface ChatSession {
  id?: number;
  title: string;
  updatedAt: number;
  lastResponseId?: string;
  chefLabel?: string; // <--- Nueva propiedad para guardar el cocinero
}


/**
 * Representa un mensaje individual dentro de una sesión.
 * Incluimos 'reasoning' para separar los pasos de pensamiento del modelo.
 */
export interface Message {
  id?: number;
  sessionId: number; // Clave foránea que apunta a ChatSession.id
  role: 'user' | 'system' | 'assistant';
  content: string;
  reasoning?: string; // Campo opcional para guardar el "Chain of Thought"
  timestamp: number;
}

/**
 * Configuración de la base de datos IndexedDB usando Dexie
 */
class FmoWinConfDatabase extends Dexie {
  sessions!: EntityTable<ChatSession, 'id'>;
  messages!: EntityTable<Message, 'id'>;

  constructor() {
    super('DB');

    // Actualiza la versión si es necesario (ej. versión 3)
    this.version(3).stores({
      sessions: '++id, updatedAt, chefLabel', // Añadimos chefLabel al índice
      messages: '++id, sessionId, timestamp'
    });
  }
}

// Instancia única de la base de datos
const db = new FmoWinConfDatabase();

/**
 * Utilidades de base de datos (Opcional, pero recomendado)
 */
export const dbUtils = {
  /** Crea una nueva sesión y devuelve su ID */
  createNewSession: async (title: string = "Nueva conversación") => {
    return await db.sessions.add({
      title,
      updatedAt: Date.now()
    });
  },

  /** Obtiene todos los mensajes de una sesión ordenados por tiempo */
  getMessagesBySession: async (sessionId: number) => {
    return await db.messages
      .where('sessionId')
      .equals(sessionId)
      .sortBy('timestamp');
  },

  /** Borra una sesión y todos sus mensajes asociados */
  deleteSession: async (sessionId: number) => {
    await db.transaction('rw', [db.sessions, db.messages], async () => {
      await db.messages.where('sessionId').equals(sessionId).delete();
      await db.sessions.delete(sessionId);
    });
  }
};

export { db };