var consumerConfig = {
  "renderers": {
    "modules": {
      "itembank-player": {
        "baseURL": "https://sm.sdk.leonardodls.com/modules/multi-item-activity-player/releases/",
        "version": "0.0.33",
        "js": "0.0.33/multiItemActivityPlayer",
        "css": "0.0.33/multiItemActivityPlayer"
      },
      "imagelabel-dnd": {
        "baseURL": "https://sm.sdk.leonardodls.com/modules/image-label-dnd-player/releases/",
        "version": "0.20.0",
        "js": "0.20.0/libs-imagelabel-dnd-item-player",
        "dependencies": [
          "react",
          "react-dom",
          "libs-player-ui-components",
          "react-dnd",
          "react-dnd-html5-backend"
        ]
      },
      "mcsr-radio": {
        "baseURL": "https://sm.sdk.leonardodls.com/modules/mcq-radio-player/releases/",
        "version": "0.13.0",
        "js": "0.13.0/libs-mcsr-radio-item-player",
        "dependencies": [
          "react",
          "react-dom",
          "libs-player-ui-components"
        ]
      },
      "fib-dnd": {
        "baseURL": "https://sm.sdk.leonardodls.com/modules/fib-dnd-player/releases/",
        "version": "0.18.0",
        "js": "0.18.0/libs-fib-dnd-item-player",
        "dependencies": [
          "react",
          "react-dom",
          "libs-player-ui-components",
          "react-dnd",
          "react-dnd-html5-backend"
        ]
      },
      "order-list": {
        "baseURL": "https://sm.sdk.leonardodls.com/modules/order-list-player/releases/",
        "version": "0.14.0",
        "js": "0.14.0/libs-order-list-item-player",
        "dependencies": [
          "react",
          "react-dom",
          "libs-player-ui-components"
        ]
      },
      "react": {
        "baseURL": "https://sm.sdk.leonardodls.com/modules/react/releases/",
        "version": "16.12.0",
        "js": "16.12.0/react.production.min"
      },
      "react-dom": {
        "baseURL": "https://sm.sdk.leonardodls.com/modules/react-dom/releases/",
        "version": "16.12.0",
        "js": "16.12.0/react-dom.production.min"
      },
      "react-dnd": {
        "baseURL": "https://sm.sdk.leonardodls.com/modules/react-dnd/releases/",
        "js": "10.0.2/ReactDnD.min"
      },
      "react-dnd-html5-backend": {
        "baseURL": "https://sm.sdk.leonardodls.com/modules/react-dnd-html5-backend/releases/",
        "js": "10.0.2/ReactDnDHTML5Backend.min"
      },
      "libs-player-ui-components": {
        "baseURL": "https://sm.sdk.leonardodls.com/modules/libs-player-ui-components/releases/",
        "version": "0.16.0",
        "js": "0.16.0/libs-player-ui-components"
      }
    }
  }
}