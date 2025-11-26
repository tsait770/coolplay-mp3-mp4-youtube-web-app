import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native'
import { Stack } from 'expo-router'
import { useVoiceControlV2 } from '@/providers/VoiceControlProviderV2'
import { BackgroundListeningManager } from '@/lib/voice/BackgroundListeningManager'

export default function VoiceE2E() {
  const voice = useVoiceControlV2()
  const [logs, setLogs] = useState<string[]>([])
  const [checks, setChecks] = useState<{ label: string; ok: boolean }[]>([])

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [`${new Date().toISOString()} ${msg}`, ...prev].slice(0, 200))
  }, [])

  const run = useCallback(async () => {
    try {
      addLog('Start E2E')
      await BackgroundListeningManager.getInstance().start('continuous')
      addLog('Background audio enabled')

      await voice.startListening()
      addLog('startListening called')

      await new Promise(res => setTimeout(res, 8000))
      const s1 = BackgroundListeningManager.getInstance().getState()
      setChecks(prev => [...prev, { label: 'Background active after 8s', ok: s1.isActive }])
      setChecks(prev => [...prev, { label: 'Voice isListening after 8s', ok: voice.isListening }])

      await new Promise(res => setTimeout(res, 20000))
      const s2 = BackgroundListeningManager.getInstance().getState()
      setChecks(prev => [...prev, { label: 'Still active after 28s', ok: s2.isActive }])
      setChecks(prev => [...prev, { label: 'Still listening after 28s', ok: voice.isListening }])

      await voice.stopListening()
      addLog('stopListening called')
      await BackgroundListeningManager.getInstance().stop()
      addLog('Background audio disabled')
    } catch (e) {
      addLog(`Error: ${e instanceof Error ? e.message : String(e)}`)
    }
  }, [voice, addLog])

  useEffect(() => {
    addLog(`Platform: ${Platform.OS}`)
  }, [addLog])

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: 'Voice E2E' }} />
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={run}><Text style={styles.btnText}>Run E2E</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={() => setLogs([])}><Text style={styles.btnText}>Clear Logs</Text></TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Checks</Text>
        {checks.map((c, i) => (<Text key={i} style={{ color: c.ok ? '#10b981' : '#ef4444' }}>{c.label}: {c.ok ? 'OK' : 'FAIL'}</Text>))}
      </View>
      <ScrollView style={styles.logs}><Text style={styles.logText}>{logs.join('\n')}</Text></ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', padding: 16 },
  row: { flexDirection: 'row', gap: 8 },
  btn: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#111827', padding: 12, borderRadius: 10, marginVertical: 12 },
  title: { color: '#fff', fontWeight: '700', marginBottom: 8 },
  logs: { flex: 1 },
  logText: { color: '#9ca3af', fontSize: 12 },
})
