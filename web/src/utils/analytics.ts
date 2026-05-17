declare global {
  interface Window {
    AhrefsAnalytics?: {
      sendEvent: (name: string, props?: Record<string, any>) => void;
    };
  }
}

export const trackEvent = (name: string, props?: Record<string, any>) => {
  if (window.AhrefsAnalytics) {
    window.AhrefsAnalytics.sendEvent(name, props);
  }
};
