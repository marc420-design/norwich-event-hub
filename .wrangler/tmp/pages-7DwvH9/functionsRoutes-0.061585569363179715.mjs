import { onRequestOptions as __scrape_events_js_onRequestOptions } from "C:\\Users\\marcc\\Desktop\\new company\\functions\\scrape-events.js"
import { onRequestPost as __scrape_events_js_onRequestPost } from "C:\\Users\\marcc\\Desktop\\new company\\functions\\scrape-events.js"

export const routes = [
    {
      routePath: "/scrape-events",
      mountPath: "/",
      method: "OPTIONS",
      middlewares: [],
      modules: [__scrape_events_js_onRequestOptions],
    },
  {
      routePath: "/scrape-events",
      mountPath: "/",
      method: "POST",
      middlewares: [],
      modules: [__scrape_events_js_onRequestPost],
    },
  ]