import React from 'react';

const NoteProviderImport = jest.requireActual('../../../src/Context');

export const NoteContext = NoteProviderImport.default;
export const NoteProvider = ({ children }: any) => (
  <NoteProviderImport.default.Provider value={{
    notes: []
  } as any}>
    {children}
  </NoteProviderImport.default.Provider>
);

export default {
  name: "notes",
  icon: <div>Notes Icon</div>,
  tags: ["productivity", "organize"],
  description: "notes widget description",
  component: () => <div>Notes Widget</div>,
};
