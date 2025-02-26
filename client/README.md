# Frontend Development Setup

Follow the steps below to get the frontend up and running on your device.

## Prerequisites

Before starting, ensure you have the following installed:
- **Expo Go** on your phone (available on the App Store for iOS).
- **Node.js** on your computer.
- **Expo CLI** on your computer.

You can test the frontend either on a mobile device or your computer, but testing on a mobile device is highly recommended.

## Testing on Mobile

If you're testing on mobile, follow these additional steps:

1. **Set up your `.env` file:**
   - Create a `.env` file in the `client` directory (not in `src`).
   - Add the following line to the `.env` file:
     ```
     API_URL=<your-device-IP>
     ```
     Replace `<your-device-IP>` with the IP address of the network your mobile device is connected to.

2. **Install dependencies:**
   - Run the following command to install the necessary dependencies:
     ```bash
     npm install
     ```

3. **Start the Expo project:**
   - Once dependencies are installed, start the Expo project with:
     ```bash
     npx expo start
     ```

4. **Open on mobile:**
   - Scan the QR code displayed in the terminal with the Expo Go app on your phone.
   - The app should open on your mobile device.

## Testing on Desktop

If you're testing on desktop, you can skip the `.env` setup step. Once dependencies are installed and the project is started, you can open the project on the web by clicking on the **localhost link** in the terminal.

## Note

- The frontend has only been tested on **iOS** devices, so we cannot guarantee functionality or identify any potential issues on **Android** devices.
