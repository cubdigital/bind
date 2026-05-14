/** TFLite/WASM often logs startup info via console.error, which triggers the Next.js dev overlay. */
const TFLITE_INFO =
  /XNNPACK delegate|Created TensorFlow Lite|TensorFlow Lite XNNPACK/i;

export function withSuppressedTfLiteConsole<T>(fn: () => T): T {
  const err = console.error;
  const warn = console.warn;
  console.error = (...args: unknown[]) => {
    if (TFLITE_INFO.test(String(args[0] ?? ""))) return;
    err.apply(console, args as Parameters<typeof err>);
  };
  console.warn = (...args: unknown[]) => {
    if (TFLITE_INFO.test(String(args[0] ?? ""))) return;
    warn.apply(console, args as Parameters<typeof warn>);
  };
  try {
    return fn();
  } finally {
    console.error = err;
    console.warn = warn;
  }
}
