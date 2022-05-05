import React, { useContext, useMemo } from 'react'
import Typography from '@mui/material/Typography'
import AddCircle from '@mui/icons-material/AddCircleOutlined'
import { Grid, Button, IconButton, Box } from '@mui/material'
import { List, arrayMove } from 'react-movable'

import { GlobalContext, DoubleClickHelper, MarqueeWindow } from '@vscode-marquee/utils'
import wrapper, { Dragger } from '@vscode-marquee/widget'

import TodoContext, { TodoProvider } from './Context'
import TodoPop from './components/Pop'
import TodoInfo from './components/Info'
import TodoFilter from './components/Filter'
import TodoItem from './components/Item'

declare const window: MarqueeWindow

let Todo = () => {
  const {
    setTodos,
    setShowAddDialog,
    showArchived,
    todos,
    hide,
    todoFilter,
  } = useContext(TodoContext)
  const { globalScope } = useContext(GlobalContext)

  let filteredItems = useMemo(() => {
    let filteredItems = todos

    if (!globalScope) {
      let filteredArr = filteredItems.filter((item) => {
        if (item['workspaceId'] === window.activeWorkspace?.id) {
          return true
        }
      })
      filteredItems = filteredArr
    }

    if (!showArchived) {
      let filteredArr = filteredItems.filter((item) => {
        if (!item.hasOwnProperty('archived') || item.archived === false) {
          return true
        }
      })
      filteredItems = filteredArr
    }

    if (todoFilter) {
      let filteredArr = filteredItems.filter((item) => {
        let inBody =
          item.body.toLowerCase().indexOf(todoFilter.toLowerCase()) !== -1
        let inTags = false

        if (item.tags && item.tags.length !== 0) {
          inTags =
            JSON.stringify(item.tags)
              .toLowerCase()
              .indexOf(todoFilter.toLowerCase()) !== -1
        }

        if (inBody || inTags) {
          return true
        }
      })
      filteredItems = filteredArr
    }

    if (hide) {
      let hideArr = filteredItems.filter((item) => {
        return item.checked === false
      })
      filteredItems = hideArr
    }

    return filteredItems
  }, [todos, globalScope, hide, todoFilter, showArchived])

  return (
    <>
      <Grid item xs={1} style={{ maxWidth: '100%' }}>
        <Box sx={{
          borderBottom: '1px solid var(--vscode-foreground)',
          padding: '8px',
        }}>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="stretch"
            alignContent="stretch"
          >
            <Grid item>
              <Grid container direction="row">
                <Grid item>
                  <Typography variant="subtitle1">Todo</Typography>
                </Grid>
                <Grid item>
                  <TodoInfo />
                </Grid>
              </Grid>
            </Grid>

            <Grid item>
              <Grid container direction="row" spacing={1}>
                <Grid item>
                  <TodoFilter />
                </Grid>
                <Grid item>
                  <IconButton aria-label="add-todo" size="small" onClick={() => setShowAddDialog(true)}>
                    <AddCircle fontSize="small" />
                  </IconButton>
                </Grid>
                <Grid item>
                  <DoubleClickHelper />
                </Grid>
                <Grid item>
                  <TodoPop />
                </Grid>
                <Grid item>
                  <Dragger />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Grid>
      <Grid item xs>
        <Grid
          container
          wrap="nowrap"
          direction="column"
          style={{ height: '100%' }}
        >
          <Grid item xs style={{ overflow: 'auto' }}>
            {filteredItems.length === 0 && (
              <Grid
                container
                alignItems="center"
                justifyContent="center"
                style={{ height: '80%', width: '100%' }}
              >
                <Grid item>
                  <Button startIcon={<AddCircle />} variant="outlined" onClick={() => setShowAddDialog(true)}>
                    Create a todo
                  </Button>
                </Grid>
              </Grid>
            )}
            <List
              lockVertically={true}
              values={filteredItems}
              onChange={({ oldIndex, newIndex }) => {
                let constrainedArr = filteredItems
                let firstTodo = constrainedArr[oldIndex]
                let secondTodo = constrainedArr[newIndex]

                let realFirstIndex = todos.findIndex((todo) => {
                  return todo.id === firstTodo.id
                })
                let realSecondIndex = todos.findIndex((todo) => {
                  return todo.id === secondTodo.id
                })

                let newTodos = arrayMove(
                  todos,
                  realFirstIndex,
                  realSecondIndex
                )
                setTodos(newTodos)
              }}
              renderList={({ children, props }) => (
                <Grid
                  container
                  direction="column"
                  style={{ padding: '8px' }}
                  {...props}
                >
                  {children}
                </Grid>
              )}
              renderItem={({ value, props, isDragged }) => (
                <TodoItem
                  key={value.id}
                  todo={value}
                  isDragged={isDragged}
                  dragProps={props}
                />
              )}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

const Widget = () => (
  <TodoProvider>
    <Todo />
  </TodoProvider>
)
export default wrapper(Widget, 'todo')
