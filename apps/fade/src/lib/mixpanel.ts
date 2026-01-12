import mixpanel from "mixpanel-browser";

export const init = () => {
  mixpanel.init("ced3fefc3848552e1238a6fe3628e881", {
    autocapture: true,
    record_sessions_percent: 100,
    api_host: "https://api-eu.mixpanel.com",
  });
};

export const track = (name: string, props?: Record<string, unknown>) => {
  mixpanel.track(name, props);
};

export default mixpanel;
