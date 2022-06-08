import ReactGA from 'react-ga4'

export function init (trackingId:string){
  ReactGA.initialize(trackingId)
}

export function trackPageViewed (path:string){
  if (path) {
    return ReactGA.pageview(path)
  }
  return ReactGA.pageview(window.location.pathname + window.location.search)
}

