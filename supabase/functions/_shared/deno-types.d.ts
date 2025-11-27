// Deno 類型定義文件
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

declare const Deno: {
  env: {
    get(key: string): string | undefined;
    toObject(): Record<string, string>;
  };
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
};

