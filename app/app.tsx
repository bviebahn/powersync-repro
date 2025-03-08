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
import "./utils/gestureHandler"
import { initI18n } from "./i18n"
import "./utils/ignoreWarnings"
import { useFonts } from "expo-font"
import { useEffect, useState } from "react"
import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context"
import * as Linking from "expo-linking"
import * as SplashScreen from "expo-splash-screen"
import { AppNavigator, useNavigationPersistence } from "./navigators"
import { ErrorBoundary } from "./screens/ErrorScreen/ErrorBoundary"
import * as storage from "./utils/storage"
import { customFontsToLoad } from "./theme"
import Config from "./config"
import { KeyboardProvider } from "react-native-keyboard-controller"
import { loadDateFnsLocale } from "./utils/formatDate"
import { ParseJSONResultsPlugin } from "kysely"
import { wrapPowerSyncWithKysely } from "@powersync/kysely-driver"
import {
  column,
  PowerSyncBackendConnector,
  PowerSyncContext,
  PowerSyncDatabase,
  Schema,
  Table,
  useQuery,
} from "@powersync/react-native"
import "@azure/core-asynciterator-polyfill"
import Logger from "js-logger"
import { Text } from "react-native"

const randomJSON = JSON.stringify({
  _id: "67cb119fd729ccda88e92f99",
  index: 0,
  guid: "c5fc7c6f-3ba2-436a-94fa-b8c2944bd322",
  isActive: true,
  balance: "$3,335.58",
  picture: "http://placehold.it/32x32",
  age: 25,
  eyeColor: "green",
  name: "Kay Bolton",
  gender: "female",
  company: "LIMOZEN",
  email: "kaybolton@limozen.com",
  phone: "+1 (885) 487-2790",
  address: "450 Harden Street, Weogufka, New Mexico, 2984",
  about:
    "Labore occaecat eu excepteur nisi sint qui incididunt ut consectetur sunt laboris. Magna pariatur aute do fugiat ipsum. Nulla ut adipisicing eiusmod labore adipisicing esse in incididunt occaecat nisi non non.\r\n",
  registered: "2022-05-09T08:09:23 -02:00",
  latitude: -65.514283,
  longitude: 114.597758,
  tags: ["aliquip", "quis", "anim", "nostrud", "nulla", "deserunt", "laborum"],
  friends: [
    {
      id: 0,
      name: "Vargas Brady",
    },
    {
      id: 1,
      name: "Maria Lawrence",
    },
    {
      id: 2,
      name: "Lori Atkins",
    },
  ],
  greeting: "Hello, Kay Bolton! You have 3 unread messages.",
  favoriteFruit: "strawberry",
})

const User = new Table({
  type: column.text,
  json: column.text,
})

const AppSchema = new Schema({
  User,
})

const powersync = new PowerSyncDatabase({
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

type Database = (typeof AppSchema)["types"]

export const db = wrapPowerSyncWithKysely<Database>(powersync, {
  plugins: [new ParseJSONResultsPlugin()],
})

class Connector implements PowerSyncBackendConnector {
  async fetchCredentials() {
    return null
  }

  async uploadData() {}
}

function GetUsers() {
  const [userFilter, setUserFilter] = useState<string>()

  const query = db.selectFrom("User").selectAll()

  if (userFilter) {
    query.where("id", "=", userFilter)
  }

  const { data } = useQuery(query)

  console.log("xx", data.length)

  useEffect(() => {
    setUserFilter("500")
  }, [])

  return <Text>Data length: {data.length}</Text>
}

/**
 * This is the root component of our app.
 * @param {AppProps} props - The props for the `App` component.
 * @returns {JSX.Element} The rendered `App` component.
 */
export function App() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const setupDb = async () => {
      console.log("setup db")

      await powersync.connect(new Connector())
      console.log("copnnected")
      await powersync.init()
      console.log("inited")
      await powersync.execute('INSERT INTO "User" (id, type, json) VALUES ("1", "user", "xcdcs")')
      console.log("inserted")
      console.log(await powersync.getAll("User"))
      await db
        .insertInto("User")
        .values(
          Array.from({ length: 1 }, (_, i) => ({
            id: String(i),
            type: "user",
            json: randomJSON,
          }))[0],
        )
        .execute()
      console.log("setup db finished")
      setIsReady(true)
    }

    setTimeout(() => {
      setupDb()
    }, 2000)
  }, [])

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ErrorBoundary catchErrors={Config.catchErrors}>
        <KeyboardProvider>{isReady && <GetUsers />}</KeyboardProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}
