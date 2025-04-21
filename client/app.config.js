import 'dotenv/config';

const API_URL = "https://chompin.onrender.com";

export default {
  expo: {
    name: "client",
    slug: "client",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    owner: "taiphlosionn",
    newArchEnabled: true,
    updates: {
      url: "https://u.expo.dev/a00d6650-4a7d-4627-9b36-f88974dca801"
    },
    runtimeVersion: {
      policy: "appVersion"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./src/assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./src/assets/images/home/logo.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      API_URL: API_URL,
      eas: {
        projectId: "a00d6650-4a7d-4627-9b36-f88974dca801"
      }
    }
  }
};
