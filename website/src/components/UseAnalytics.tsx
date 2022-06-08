import ReactGA from 'react-ga4'

type UseAnalyticsFunction = {
  init: (trackingId: string) => void;
  trackPageViewed: (path: string) => void;
}

export const useAnalytics = () : UseAnalyticsFunction => {
  return {
    init: (trackingId: string) => {
      ReactGA.initialize(trackingId)
    },
    trackPageViewed: (path: string) => {
      if (path) {
        return ReactGA.pageview(path)
      }
      return ReactGA.pageview(window.location.pathname + window.location.search)
    },
  }
}