import ExpoModulesCore
import Speech

class VoiceModuleiOS: Module {
  public func definition() -> ModuleDefinition {
    Name("VoiceModuleiOS")

    // Defines a JavaScript function that calls the native module
    Function("startListening") { (localeIdentifier: String) in
      // TODO: Implement SFSpeechRecognizer initialization and start listening
      print("Starting listening for locale: \(localeIdentifier)")
      return "Listening started"
    }

    Function("stopListening") {
      // TODO: Implement SFSpeechRecognizer stop listening
      print("Stopping listening")
      return "Listening stopped"
    }

    // Defines an event that can be sent from native to JavaScript
    Events("onSpeechResult", "onSpeechError")

    // Example function to send an event
    Function("sendTestEvent") {
        self.sendEvent("onSpeechResult", [
            "text": "Test speech result",
            "confidence": 0.95
        ])
    }
  }
}
