/**
 * Polyfill for CustomEvent for environments where it is not defined (e.g., some React Native setups).
 * The error "ReferenceError: Property 'CustomEvent' doesn't exist" suggests this is missing.
 * This polyfill is based on the MDN documentation for CustomEvent.
 */
if (typeof CustomEvent !== 'function') {
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
}
