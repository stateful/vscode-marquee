import React, { MouseEvent, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Typography from '@mui/material/Typography'
import AddCircle from '@mui/icons-material/AddCircleOutlined'
import { Grid, Button, IconButton, Dialog, Popover } from '@mui/material'
import { List, arrayMove } from 'react-movable'

import { GlobalContext, DoubleClickHelper, MarqueeWindow } from '@vscode-marquee/utils'
import wrapper, { Dragger, HeaderWrapper, ToggleFullScreen } from '@vscode-marquee/widget'
import MoreVertIcon from '@mui/icons-material/MoreVert'

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
  const [fullscreenMode, setFullscreenMode] = useState(false)
  const { globalScope } = useContext(GlobalContext)
  const [minimizeNavIcon, setMinimizeNavIcon] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [anchorEl, setAnchorEl] = useState(null as (HTMLButtonElement | null))
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleToggleFullScreen = () => {
    setFullscreenMode(!fullscreenMode)
    handleClose()
  }
  const open = Boolean(anchorEl)
  const id = open ? 'todo-nav-popover' : undefined

  useEffect(() => {
    if ((ref !== null && ref.current !== null) && ref.current?.offsetWidth < 330) {
      return setMinimizeNavIcon(true)
    }
    setMinimizeNavIcon(false)
  }, [ref.current?.offsetWidth])

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

  const TodoUIBody = () => (
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
  )
  if (!fullscreenMode) {
    return (
      <div ref={ref} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <HeaderWrapper>
          <>
            <Grid item xs={4}>
              <Typography variant="subtitle1">Todo <TodoInfo /></Typography>
            </Grid>

            {!minimizeNavIcon && <Grid item xs={8}>
              <Grid container justifyContent="right" direction="row" spacing={1}>
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
                  <ToggleFullScreen toggleFullScreen={handleToggleFullScreen} isFullScreenMode={fullscreenMode} />
                </Grid>
                <Grid item>
                  <Dragger />
                </Grid>
              </Grid>
            </Grid>
            }
            {minimizeNavIcon &&
              <Grid item xs={8}>
                <Grid container justifyContent="right" direction="row" spacing={1}>
                  <Grid item>
                    <IconButton onClick={handleClick}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <Popover
                      open={open}
                      id={id}
                      anchorEl={anchorEl}
                      onClose={handleClose}
                      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                    >
                      <Grid item padding={1}>
                        <Grid container justifyContent="right" direction="column-reverse" spacing={1}>
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
                            <ToggleFullScreen
                              toggleFullScreen={handleToggleFullScreen}
                              isFullScreenMode={fullscreenMode}
                            />
                          </Grid>
                          <Grid item>
                            <Dragger />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Popover>
                  </Grid>
                </Grid>
              </Grid>
            }
          </>
        </HeaderWrapper>
        <TodoUIBody />
      </div >
    )
  }
  return (
    <Dialog fullScreen open={fullscreenMode} onClose={() => setFullscreenMode(false)}>
      <HeaderWrapper>
        <>
          <Grid item xs={4}>
            <Typography variant="subtitle1">Todo <TodoInfo /></Typography>
          </Grid>

          <Grid item xs={8}>
            <Grid container justifyContent="right" direction="row" spacing={1}>
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
                <ToggleFullScreen toggleFullScreen={handleToggleFullScreen} isFullScreenMode={fullscreenMode} />
              </Grid>
            </Grid>
          </Grid>
        </>
      </HeaderWrapper>
      <TodoUIBody />
    </Dialog>
  )
}

const Widget = () => (
  <TodoProvider>
    <Todo />
  </TodoProvider>
)
export default wrapper(Widget, 'todo')
