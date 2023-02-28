import React, { useContext }  from 'react'
import { CircularProgress, Grid, IconButton, Link, Typography } from '@mui/material'
import wrapper, { Dragger, HeaderWrapper, NavIconDropdown } from '@vscode-marquee/widget'
import type { MarqueeWidgetProps } from '@vscode-marquee/widget'
import PopupState from 'material-ui-popup-state'
import DependencyContext, { DependencyProvider } from './Context'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons/faRefresh'
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink'
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
import { faAnglesUp } from '@fortawesome/free-solid-svg-icons/faAnglesUp'
import { GlobalContext } from '@vscode-marquee/utils'
import { DependencyVersion } from './components/DependencyVersion'
import DependenciesPop from './components/Pop'
import semverGt from 'semver/functions/gt'
import { DisplayedDependency } from './types'

const Dependencies = ({ ToggleFullScreen, fullscreenMode, minimizeNavIcon }: MarqueeWidgetProps) => {
  const {
    dependencies: _dependencies,
    loading,
    _refreshDependencies,
    _updateDependency,
    _removeDependency,
    _updateAllDependencies,
    capabilities,
    showUpToDate
  } = useContext(DependencyContext)

  const { themeColor } = useContext(GlobalContext)

  const needsUpgrade = (dep: DisplayedDependency, versionTo?: string) => {
    if(!capabilities.upgradeDependency) { return false }
    if(capabilities.explicitNeedsUpgrade) { return !!dep.needsUpgrade }

    versionTo ??= dep.versions.latest ?? dep.versions.wanted

    if(!dep.versions.current || !versionTo) { return false }

    return semverGt(versionTo, dep.versions.current)
  }

  const dependencies =  [..._dependencies]
    .sort((a, b) => (needsUpgrade(b) ? 1 : 0) - (needsUpgrade(a) ? 1 : 0))
    .filter(dep => showUpToDate || needsUpgrade(dep))

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
          <IconButton
            disabled={loading}
            onClick={() => _refreshDependencies()}
            aria-label='Refresh Dependencies'
          >
            <FontAwesomeIcon
              icon={faRefresh}
              fontSize='small'
            />
          </IconButton>
        </Grid>
        { capabilities.upgradeAllDependencies && (
          <Grid item>
            <IconButton
              onClick={() => _updateAllDependencies()}
              aria-label='Upgrade All Dependencies'
              disabled={loading || !dependencies.some(dep => needsUpgrade(dep))}
            >
              <FontAwesomeIcon
                icon={faAnglesUp}
                fontSize='small'
              />
            </IconButton>
          </Grid>
        )}
        <Grid item>
          <DependenciesPop />
        </Grid>
        <Grid
          item
        >
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

  return (
    <>
      <HeaderWrapper>
        <Grid item>
          <Typography variant="subtitle1">Dependencies</Typography>
        </Grid>
        {minimizeNavIcon ?
          <PopupState variant='popper' popupId='widget-dependencies'>
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
            {loading && (
              <Grid
                container
                style={{ height: '100%' }}
                alignItems="center"
                justifyContent="center"
                direction="column"
              >
                <Grid item>
                  <CircularProgress color="secondary" />
                </Grid>
              </Grid>
            )}

            {!loading && dependencies.length === 0 && (
              <Typography align="center" marginTop={1}>
                { showUpToDate ?
                  'No dependencies'
                  :
                  'All dependencies up-to-date!'
                }
              </Typography>
            )}

            {!loading && dependencies.length > 0 && (
              <Grid
                aria-label="dependency-list"
                container
                alignItems="center"
              >
                {dependencies.map((dep) => {
                  return (
                    <Grid
                      key={[dep.name, dep.project ?? ''].toString()}
                      aria-label="dependency-entry"
                      alignItems="center"
                      container
                      columnSpacing={2}
                      marginY={0.5}
                      padding={2}
                      sx={{
                        background: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, 0.5)`,
                      }}
                    >
                      <Grid item xs={3}
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        <Typography
                          component="span"
                          aria-label="dependency-name-text"
                        >
                          {dep.name}
                        </Typography>
                      </Grid>

                      <Grid item xs={7}>
                        <Grid
                          container
                          flexDirection="row"
                          gap={theme => theme.spacing(4)}
                        >
                          {(dep.versions.current || dep.versions.query) && (
                            <DependencyVersion
                              version={dep.versions.current ?? dep.versions.query}
                              caption="current"
                            />
                          )}

                          {dep.versions.wanted && (
                            <DependencyVersion
                              version={dep.versions.wanted}
                              caption="wanted"
                              upgrade={needsUpgrade(dep, dep.versions.wanted) && (() =>
                                _updateDependency(dep, dep.versions.wanted!)
                              )}
                            />
                          )}

                          {dep.versions.latest && (
                            <DependencyVersion
                              version={dep.versions.latest}
                              caption="latest"
                              upgrade={needsUpgrade(dep, dep.versions.latest) && (() =>
                                _updateDependency(dep, dep.versions.latest!)
                              )}
                            />
                          )}
                        </Grid>
                      </Grid>

                      <Grid item xs={2}>
                        <Grid
                          container
                          justifyContent="end"
                          alignItems="center"
                          direction="row-reverse"
                        >
                          { dep.url && (
                            <Link
                              href={dep.url}
                            >
                              <IconButton
                                aria-label="dependency-url-button"
                              >
                                <FontAwesomeIcon
                                  icon={faLink}
                                  fontSize='medium'
                                />
                              </IconButton>
                            </Link>
                          )}

                          { capabilities.deleteDependency && (
                            <IconButton
                              onClick={() => _removeDependency(dep)}
                              aria-label="dependency-delete-button"
                            >
                              <FontAwesomeIcon
                                icon={faTrash}
                                fontSize='medium'
                              />
                            </IconButton>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  )
                })}
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default wrapper((props: any) => (
  <DependencyProvider>
    <Dependencies {...props} />
  </DependencyProvider>
), 'dependencies')
