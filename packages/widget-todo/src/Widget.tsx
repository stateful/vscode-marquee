import React, { useContext, useEffect, useMemo, useState } from 'react'
import Typography from '@mui/material/Typography'
import AddCircle from '@mui/icons-material/AddCircleOutlined'
import { Grid, Button, IconButton, Link } from '@mui/material'
import { List, arrayMove } from 'react-movable'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCloud } from '@fortawesome/free-solid-svg-icons'
import PopupState from 'material-ui-popup-state'

import { GlobalContext, DoubleClickHelper, MarqueeEvents, getEventListener } from '@vscode-marquee/utils'
import wrapper, { Dragger, HeaderWrapper, NavIconDropdown } from '@vscode-marquee/widget'
import { FeatureInterestDialog } from '@vscode-marquee/dialog'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'

import TodoContext, { TodoProvider } from './Context'
import TodoPop from './components/Pop'
import TodoInfo from './components/Info'
import TodoFilter from './components/Filter'
import TodoItem from './components/Item'
import { filterItems } from './utils'
import type { Events } from './types'


let Todo = ({ ToggleFullScreen, minimizeNavIcon, fullscreenMode } : MarqueeWidgetProps) => {
  const eventListener = getEventListener<Events & MarqueeEvents>()
  const {
    setTodos,
    setShowAddDialog,
    showArchived,
    todos,
    hide,
    todoFilter,
    setTodoFilter
  } = useContext(TodoContext)
  const { globalScope, setGlobalScope } = useContext(GlobalContext)
  const [showCloudSyncFeature, setShowCloudSyncFeature] = useState(false)

  const _isInterestedInSyncFeature = (interested: boolean) => {
    if (interested) {
      return eventListener.emit('telemetryEvent', { eventName: 'syncInterestNoteYes' })
    }
    eventListener.emit('telemetryEvent', { eventName: 'syncInterestNoteNo' })
  }

  useEffect(() => {
    eventListener.on('openCloudSyncFeatureInterest', setShowCloudSyncFeature)
  }, [])

  const NavButtons = () => (
    <Grid item>
      <Grid
        container
        justifyContent="right"
        direction={minimizeNavIcon ? 'column-reverse' : 'row'}
        spacing={1}
        alignItems="center"
        padding={minimizeNavIcon ? 0.5 : 0}
      >
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
          <IconButton onClick={() => setShowCloudSyncFeature(true)}>
            <FontAwesomeIcon icon={faCloud} fontSize={'small'} />
          </IconButton>
        </Grid>
        <Grid item>
          <ToggleFullScreen />
        </Grid>
        {!fullscreenMode &&
          <Grid item>
            <Dragger />
          </Grid>
        }
      </Grid>
    </Grid>
  )

  const filteredItems = useMemo(() => (
    filterItems(todos, { globalScope, hide, todoFilter, showArchived })
  ), [todos, globalScope, hide, todoFilter, showArchived])
  const todosInGlobalScope = useMemo(() => (
    filterItems(todos, { globalScope: true, hide, showArchived }).length
  ), [todos, globalScope, hide, showArchived])

  return (
    <>
      {showCloudSyncFeature &&
        <FeatureInterestDialog
          _isInterestedInSyncFeature={_isInterestedInSyncFeature}
          setShowCloudSyncFeature={setShowCloudSyncFeature}
        />
      }
      <HeaderWrapper>
        <Grid item xs={4}>
          <Typography variant="subtitle1">
            Todo
            <TodoInfo />
          </Typography>
        </Grid>
        {minimizeNavIcon ?
          <PopupState variant='popper' popupId='widget-todo'>
            {(popupState) => {
              return (
                <NavIconDropdown popupState={popupState}>
                  <NavButtons />
                </NavIconDropdown>
              )}}
          </PopupState>
          :
          <Grid item xs={8}>
            <NavButtons />
          </Grid>
        }
      </HeaderWrapper>
      <Grid item xs>
        <Grid
          container
          wrap="nowrap"
          direction="column"
          style={{ height: '100%' }}
        >
          <Grid item xs style={{ overflow: 'auto' }}>
            {filteredItems.length === 0 && (
              <>
                <Grid
                  container
                  alignItems="center"
                  justifyContent="center"
                  style={{ height: '80%', width: '100%' }}
                >
                  <Grid item>
                    <Button startIcon={<AddCircle />} variant="outlined" onClick={() => setShowAddDialog(true)}>
                      Create a Todo
                    </Button>
                  </Grid>
                </Grid>
                {((todoFilter && todoFilter.length) || (!globalScope && todosInGlobalScope > 0)) && (
                  <Grid container data-testid="noteExistanceNotif">
                    <Grid item textAlign={'center'} width={'100%'}>
                      {/* Notify user why they don't see any todos if they have
                          a filter set or are in workspace scope while todo is
                          in global scope
                      */}
                      {todoFilter && todoFilter.length > 0
                        ? <>
                          No Todos found, seems you have a filter set.<br />
                          <Link href="#" onClick={() => setTodoFilter('')}>Clear Filter</Link>
                        </>
                        : <>
                          There {filterItems(todos, { globalScope: true, hide, showArchived }).length === 1
                            ? <>is <b style={{ fontWeight: 'bold' }}>1</b> todo</>
                            : <>are <b style={{ fontWeight: 'bold' }}>{
                              filterItems(todos, { globalScope: true, hide, showArchived }).length
                            }</b> todos</>
                          } in Global Scope.<br />
                          <Link href="#" onClick={() => setGlobalScope(true)}>
                            Switch to Global Scope
                          </Link>
                        </>
                      }
                    </Grid>
                  </Grid>
                )}
              </>
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

const Widget = (props: any) => {
  return (
    <TodoProvider>
      <Todo {...props} />
    </TodoProvider>
  )
}
export default wrapper(Widget, 'todo')
