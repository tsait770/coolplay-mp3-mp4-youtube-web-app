package com.coolplay.voicecontrol

import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments

class VoiceModuleAndroid(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), RecognitionListener {

    private val TAG = "VoiceModuleAndroid"
    private var speechRecognizer: SpeechRecognizer? = null
    private var recognizerIntent: Intent? = null

    override fun getName(): String {
        return "VoiceModuleAndroid"
    }

    @ReactMethod
    fun startListening(localeIdentifier: String) {
        if (speechRecognizer == null) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)
            speechRecognizer?.setRecognitionListener(this)
        }

        recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, localeIdentifier)
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, reactApplicationContext.packageName)
            // TODO: Add support for continuous listening (auto-restart loop)
        }

        reactApplicationContext.currentActivity?.runOnUiThread {
            speechRecognizer?.startListening(recognizerIntent)
            Log.d(TAG, "Starting listening for locale: $localeIdentifier")
        }
    }

    @ReactMethod
    fun stopListening() {
        reactApplicationContext.currentActivity?.runOnUiThread {
            speechRecognizer?.stopListening()
            Log.d(TAG, "Stopping listening")
        }
    }

    // RecognitionListener implementation
    override fun onReadyForSpeech(params: Bundle?) {
        // Send event to JS
    }

    override fun onBeginningOfSpeech() {
        // Send event to JS
    }

    override fun onRmsChanged(rmsdB: Float) {}

    override fun onBufferReceived(buffer: ByteArray?) {}

    override fun onEndOfSpeech() {
        // Send event to JS
    }

    override fun onError(error: Int) {
        // Send error event to JS
        Log.e(TAG, "Speech recognition error: $error")
    }

    override fun onResults(results: Bundle?) {
        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
        val confidenceScores = results?.getFloatArray(SpeechRecognizer.CONFIDENCE_SCORES)

        if (!matches.isNullOrEmpty()) {
            val resultText = matches[0]
            val confidence = confidenceScores?.get(0) ?: 0.0f
            
            val map: WritableMap = Arguments.createMap()
            map.putString("text", resultText)
            map.putDouble("confidence", confidence.toDouble())
            
            // Send event to JS
            // TODO: Implement event sending mechanism
            Log.d(TAG, "Result: $resultText, Confidence: $confidence")
        }
        // TODO: Implement auto-restart loop here
    }

    override fun onPartialResults(partialResults: Bundle?) {}

    override fun onEvent(eventType: Int, params: Bundle?) {}
}
