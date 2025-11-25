#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(VoiceNative, RCTEventEmitter)
RCT_EXTERN_METHOD(startContinuousListening)
RCT_EXTERN_METHOD(stopListening)
@end

