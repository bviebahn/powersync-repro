/* eslint-disable import/first */
/**
 * Welcome to the main entry point of the app. In this file, we'll
 * be kicking off our app.
 *
 * Most of this file is boilerplate and you shouldn't need to modify
 * it very often. But take some time to look through and understand
 * what is going on here.
 *
 * The app navigation resides in ./app/navigators, so head over there
 * if you're interested in adding screens and navigators.
 */
if (__DEV__) {
  // Load Reactotron in development only.
  // Note that you must be using metro's `inlineRequires` for this to work.
  // If you turn it off in metro.config.js, you'll have to manually import it.
  require("./devtools/ReactotronConfig.ts")
}
import "@azure/core-asynciterator-polyfill"
import { column, PowerSyncDatabase, Schema, Table } from "@powersync/react-native"
import Logger from "js-logger"
import { Text } from "react-native"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import Config from "./config"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import "./utils/gestureHandler"
import "./utils/ignoreWarnings"

const User = new Table({
  type: column.text,
  json: column.text,
})

const AppSchema = new Schema({
  User,
})

export const powersync = new PowerSyncDatabase({
  schema: AppSchema,
  database: {
    // Filename for the SQLite database — it's important to only instantiate one instance per file.
    dbFilename: "test.db",
    debugMode: true,
    // Optional. Directory where the database file is located.'
    // dbLocation: 'path/to/directory'
  },
  logger: Logger,
})

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <KeyboardProvider>
          <Text style={{ margin: 100 }}>Hello</Text>
        </KeyboardProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}
