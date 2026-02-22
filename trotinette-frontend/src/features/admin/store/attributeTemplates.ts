import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AttributeTemplate {
  id: string;
  name: string;
  keys: string[];
}

interface AttributeTemplateState {
  templates: AttributeTemplate[];
  addTemplate: (name: string, keys: string[]) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, name: string, keys: string[]) => void;
}

export const useAttributeTemplates = create<AttributeTemplateState>()(
  persist(
    (set) => ({
      templates: [],

      addTemplate: (name, keys) =>
        set((state) => ({
          templates: [
            ...state.templates,
            { id: Date.now().toString(36), name, keys },
          ],
        })),

      removeTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      updateTemplate: (id, name, keys) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, name, keys } : t
          ),
        })),
    }),
    { name: 'attribute-templates' }
  )
);
