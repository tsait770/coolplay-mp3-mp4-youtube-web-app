import ExpoModulesCore
import Speech
import AVFoundation

class VoiceModuleiOS: Module {
    
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    public func definition() -> ModuleDefinition {
        Name("VoiceModuleiOS")
        
        // 權限請求
        Function("requestAuthorization") { () -> Bool in
            var isAuthorized = false
            SFSpeechRecognizer.requestAuthorization { authStatus in
                switch authStatus {
                case .authorized:
                    isAuthorized = true
                default:
                    isAuthorized = false
                }
            }
            return isAuthorized
        }

        // 開始監聽
        Function("startListening") { (localeIdentifier: String) in
            // 1. 停止前一個任務
            self.stopListeningInternal()
            
            // 2. 設定 SFSpeechRecognizer 的 Locale
            guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: localeIdentifier)), recognizer.isAvailable else {
                self.sendEvent("onSpeechError", ["code": "UNAVAILABLE", "message": "Speech recognizer is not available for this locale."])
                return
            }
            
            // 3. 設定 AVAudioSession
            do {
                let audioSession = AVAudioSession.sharedInstance()
                // 設置 category: .playAndRecord 允許背景播放時同時錄音
                try audioSession.setCategory(.playAndRecord, mode: .measurement, options: [.duckOthers, .allowBluetooth])
                try audioSession.setActive(true, options: .notifyOthersOnDeactivation)
            } catch {
                self.sendEvent("onSpeechError", ["code": "AUDIO_SESSION_ERROR", "message": "Failed to set up audio session: \(error.localizedDescription)"])
                return
            }
            
            // 4. 建立 Recognition Request
            self.recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
            guard let recognitionRequest = self.recognitionRequest else {
                self.sendEvent("onSpeechError", ["code": "REQUEST_ERROR", "message": "Unable to create an SFSpeechAudioBufferRecognitionRequest object"])
                return
            }
            
            recognitionRequest.shouldReportPartialResults = true
            
            // 5. 建立 Recognition Task
            self.recognitionTask = recognizer.recognitionTask(with: recognitionRequest) { result, error in
                var isFinal = false
                
                if let result = result {
                    let bestTranscription = result.bestTranscription
                    let confidence = bestTranscription.segments.map { $0.confidence }.reduce(0.0, +) / Double(bestTranscription.segments.count)
                    
                    self.sendEvent("onSpeechResult", [
                        "text": bestTranscription.formattedString,
                        "confidence": confidence,
                        "isFinal": result.isFinal
                    ])
                    isFinal = result.isFinal
                }
                
                if error != nil || isFinal {
                    self.stopListeningInternal()
                    if let error = error as? NSError {
                        // 處理中斷事件 (例如: SFSpeechErrorDomain code=203 "Recording stopped")
                        // 這裡可以實作 auto-restart 邏輯
                        if error.code == 203 { // SFSpeechErrorDomain code=203 is often "Recording stopped"
                            self.sendEvent("onSpeechError", ["code": "RECORDING_STOPPED", "message": "Recording stopped, attempting auto-restart..."])
                            // TODO: 實作 auto-restart 邏輯
                        } else {
                            self.sendEvent("onSpeechError", ["code": "RECOGNITION_FAILED", "message": error.localizedDescription])
                        }
                    }
                }
            }
            
            // 6. 設定 Audio Engine
            let inputNode = self.audioEngine.inputNode
            let recordingFormat = inputNode.outputFormat(forBus: 0)
            inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { (buffer: AVAudioPCMBuffer, when: AVAudioTime) in
                self.recognitionRequest?.append(buffer)
            }
            
            self.audioEngine.prepare()
            
            do {
                try self.audioEngine.start()
                self.sendEvent("onSpeechStatus", ["status": "LISTENING_STARTED"])
            } catch {
                self.stopListeningInternal()
                self.sendEvent("onSpeechError", ["code": "AUDIO_ENGINE_ERROR", "message": "Audio engine failed to start: \(error.localizedDescription)"])
            }
        }

        // 停止監聽
        Function("stopListening") {
            self.stopListeningInternal()
            self.sendEvent("onSpeechStatus", ["status": "LISTENING_STOPPED"])
        }
        
        // 內部停止邏輯
        AsyncFunction("stopListeningInternal") {
            self.audioEngine.stop()
            self.audioEngine.inputNode.removeTap(onBus: 0)
            self.recognitionRequest?.endAudio()
            self.recognitionRequest = nil
            self.recognitionTask?.cancel()
            self.recognitionTask = nil
            
            // 嘗試將 AudioSession 設為非活動狀態，但保留 category 以便背景播放
            do {
                try AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
            } catch {
                print("Failed to deactivate audio session: \(error.localizedDescription)")
            }
        }

        // 定義事件
        Events("onSpeechResult", "onSpeechError", "onSpeechStatus")
    }
}
