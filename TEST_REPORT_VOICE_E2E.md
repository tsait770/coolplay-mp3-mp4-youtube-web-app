# Voice E2E 測試報告

## 測試環境
- 平台：iOS (真機)、Android、Web
- App：Expo SDK 54，Managed workflow

## 測試步驟
1. 打開路由 `/voice-e2e`
2. 點擊 `Run E2E`
3. 觀察 Logs 與 Checks

## 驗收項目
- 8s 時背景音訊 active
- 28s 時仍 active 且 isListening 為 true（在允許情況下）
- stop 後狀態恢復

## 問題與建議
- 若權限被拒絕，需在系統設定手動允許
- Expo Go 下背景常駐可能受限，建議使用 Release/TF 測試

