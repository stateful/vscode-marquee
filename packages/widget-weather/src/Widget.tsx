import React, { useContext } from 'react'

// @ts-expect-error no types available
import WeatherIcon from 'react-icons-weather'
import { Grid, Typography, CircularProgress, Box } from '@mui/material'

import { GlobalContext, NetworkError } from '@vscode-marquee/utils'
import wrapper, { Dragger, HidePop } from '@vscode-marquee/widget'

import WeatherContext, { WeatherProvider } from './Context'
import { WeatherDialogLauncher } from './components/Dialog'
import { kToF, kToC, formatAMPM } from './utils'
import { SCALE_OPTIONS } from './constants'
import type { Forecast } from './types'

let Today = React.memo(({ current, hourly }: Pick<Forecast, 'current' | 'hourly'>) => {
  const { scale } = useContext(WeatherContext)
  const { themeColor } = useContext(GlobalContext)

  const fiveHours = hourly.slice(0, 5)

  return (
    <Grid
      container
      direction="column"
      style={{ height: '100%', width: '100%' }}
      wrap="nowrap"
    >
      <Grid item xs={6} style={{ maxWidth: '100%' }}>
        <Grid
          container
          direction="row"
          spacing={2}
          alignItems="center"
          wrap="nowrap"
          justifyContent="space-evenly"
        >
          <Grid item>
            <WeatherIcon
              name="owm"
              iconId={`${current.weather[0].id}`}
              flip="horizontal"
              rotate="90"
              style={{ fontSize: '75px' }}
            />
          </Grid>
          <Grid item>
            <Grid container direction="column">
              <Grid aria-label="Current Temperature" item>
                <Typography variant={'h5'}>
                  {scale === SCALE_OPTIONS[0].name && (
                    <>{kToF(current.temp)}&#176;F</>
                  )}
                  {scale === SCALE_OPTIONS[1].name && (
                    <>{kToC(current.temp)}&#176;C</>
                  )}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="overline">
                  {current.weather[0].description}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2">
                  <Box component="span" sx={{
                    paddingRight: '10px'
                  }}>🌅</Box>
                  {formatAMPM(new Date(current.sunrise * 1000))}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2">
                  <Box component="span" sx={{
                    paddingRight: '10px'
                  }}>🌇</Box>
                  {formatAMPM(new Date(current.sunset * 1000))}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid
        item
        xs={6}
        style={{
          maxWidth: '100%',
        }}
      >
        <div
          style={{
            background: `rgba(${themeColor.r}, ${themeColor.g}, ${themeColor.b}, ${themeColor.a || 1})`,
            padding: '8px',
            borderRadius: '4px',
          }}
        >
          <Grid container direction="column">
            <Grid item>
              <Typography variant="subtitle2">Today's forecast</Typography>
            </Grid>
            <Grid item>&nbsp;</Grid>
            <Grid item>
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                wrap="nowrap"
                spacing={1}
              >
                {fiveHours.map((hour) => {
                  const forecast = formatAMPM(new Date(hour.dt * 1000))
                  return (
                    <Grid item key={hour.dt}>
                      <Grid
                        container
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Grid item>
                          <WeatherIcon
                            name="owm"
                            iconId={`${hour.weather[0].id}`}
                            flip="horizontal"
                            rotate="90"
                            style={{ fontSize: '30px' }}
                          />
                        </Grid>

                        <Grid aria-label={`Weather Forecase for ${forecast}`} item style={{ paddingTop: '8px' }}>
                          <Typography variant="caption">
                            {scale === SCALE_OPTIONS[0].name && (
                              <>{kToF(hour.temp)}&#176;F</>
                            )}
                            {scale === SCALE_OPTIONS[1].name && (
                              <>{kToC(hour.temp)}&#176;C</>
                            )}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="caption">
                            {forecast}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  )
                })}
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid>
  )
})

const Weather = () => {
  const { city, forecast, error, isFetching } = useContext(WeatherContext)

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
            alignItems="center"
          >
            <Grid item xs={8}>
              {city && (
                <Typography variant="subtitle1">
                  Weather in{' '}
                  {city.replace(', United States', '').replace(', USA', '')}
                </Typography>
              )}
              {!city && <Typography variant="subtitle1">Weather</Typography>}
            </Grid>
            <Grid item xs={4}>
              <Grid container direction="row" spacing={1} justifyContent="flex-end">
                <Grid item>
                  <WeatherDialogLauncher />
                </Grid>
                <Grid item>
                  <HidePop name="weather" />
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
          {error && (
            <Grid
              item
              xs
              style={{
                overflow: 'auto',
                height: '100%',
                width: '100%',
                padding: '24px',
              }}
            >
              <NetworkError message={error.message} />
            </Grid>
          )}
          {!error && isFetching && (
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
          {!error && !isFetching && forecast && (<Grid
            item
            xs
            style={{
              overflow: 'auto',
              height: '100%',
              width: '100%',
              padding: '24px',
            }}
          >
            <Today current={forecast.current} hourly={forecast.hourly} />
          </Grid>)}
        </Grid>
      </Grid>
    </>
  )
}

export default wrapper(() => (
  <WeatherProvider>
    <Weather />
  </WeatherProvider>
), 'weather')
