import { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, Text, View, Button, Image } from 'react-native'
import * as Browser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import * as SecureStore from 'expo-secure-store'

type User = {
  id: string
  username: string
  avatar: string
}
type Provider = 'github' | 'discord' | 'google'

const apiUrl = process.env.EXPO_PUBLIC_API_URL
const session_token = 'session_token'

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(
    undefined
  )
  const redirectURL = Linking.createURL('login')

  const getUser = async (sessionToken: string): Promise<User | null> => {
    const res = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })

    if (!res.ok) return null
    return await res.json()
  }

  const signIn = async (provider: Provider) => {
    const result = await Browser.openAuthSessionAsync(
      `${apiUrl}/auth/login/${provider}`,
      redirectURL,
      { preferEphemeralSession: true }
    )

    if (result.type !== 'success') return
    const url = Linking.parse(result.url)

    const sessionToken = url.queryParams?.session_token?.toString() ?? null
    if (!sessionToken) return

    const user = await getUser(sessionToken)
    await SecureStore.setItemAsync(session_token, sessionToken)
    setCurrentUser(user)
  }

  const signOut = async () => {
    const sessionToken = await SecureStore.getItemAsync(session_token)
    const res = await fetch(`${apiUrl}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })

    if (!res.ok) return
    await SecureStore.deleteItemAsync(session_token)
    setCurrentUser(null)
  }

  useEffect(() => {
    const setup = async () => {
      const sessionToken = await SecureStore.getItemAsync(session_token)
      let user: User | null = null

      if (sessionToken) {
        user = await getUser(sessionToken)
        if (!user) {
          await SecureStore.deleteItemAsync(session_token)
        }
      } else {
        await SecureStore.deleteItemAsync(session_token)
      }
      setCurrentUser(user)
    }
    setup()
  }, [])

  return (
    <View style={styles.container}>
      <Text>{redirectURL}</Text>
      <Text style={[styles.text, { fontSize: 24, fontWeight: '600' }]}>
        Expo OAuth with Lucia
      </Text>
      <View style={styles.providers}>
        {currentUser === undefined ? (
          <Text style={styles.text}>Loading...</Text>
        ) : currentUser ? (
          <View style={styles.userInfo}>
            <Image
              style={{ width: 100, height: 100 }}
              source={{ uri: currentUser.avatar }}
            />
            <Text style={[styles.text, { fontSize: 16 }]}>
              username: {currentUser.username}
            </Text>
            <Text style={styles.text}>id: {currentUser.id}</Text>
            <Button title="Sign out" onPress={signOut} />
          </View>
        ) : (
          <>
            <Button
              title="Sign in with Github"
              onPress={() => signIn('github')}
            />
            <Button
              title="Sign in with Discord"
              onPress={() => signIn('discord')}
            />
            <Button
              title="Sign in with Google"
              onPress={() => signIn('google')}
            />
          </>
        )}
      </View>
      <StatusBar style="dark" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  providers: {
    marginTop: 10,
    gap: 10,
    minHeight: 200,
    justifyContent: 'center',
  },
  text: {
    color: 'white',
  },
})
