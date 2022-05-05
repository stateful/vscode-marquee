import React from 'react'

const TodoProviderImport = jest.requireActual('../../../src/Context')

export const TodoContext = TodoProviderImport.default
export const TodoProvider = ({ children }: any) => (
  <TodoProviderImport.default.Provider value={{
    todos: []
  } as any}>
    {children}
  </TodoProviderImport.default.Provider>
)

export default {
  name: 'todo',
  icon: <div>TodoIcon</div>,
  tags: ['todo', 'organization', 'productivity'],
  description: 'The Todo widget for simplifying priorities.',
  component: () => <div>TodoWidget</div>,
}
