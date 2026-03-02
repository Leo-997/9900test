/* eslint-disable @typescript-eslint/no-explicit-any */

export type CanvasXpressConstructor = new (
  target: string,
  data: unknown,
  config: unknown,
  events?: unknown,
) => ICanvasXpressInstance;

export interface ICanvasXpressInstance {
  destroy?: () => void;
  updateData?: (data: unknown) => void;
  updateConfig?: (config: unknown) => void;
  [key: string]: unknown;
}

/**
 * Singleton loader for CanvasXpress
 */
class CanvasXpressLoader {
  private static loadPromise: Promise<CanvasXpressConstructor> | null = null;

  private static cachedConstructor: CanvasXpressConstructor | null = null;

  private static setupGlobalShims(): void {
    const w = window as any;
    w.CanvasXpress ??= {};
    w.cxplot ??= {};
    w.ml ??= {};
    w.m ??= {};
    w.aes ??= (): void => undefined;
    w.clone ??= (x: any) => x;
    w.isArray ??= Array.isArray;
    w.isObject ??= (x: any) => x !== null && typeof x === 'object';
    w.isString ??= (x: any) => typeof x === 'string';
    w.isNumber ??= (x: any) => typeof x === 'number';
    w.isFunction ??= (x: any) => typeof x === 'function';
    w.isUndefined ??= (x: any) => x === undefined;
    w.isNull ??= (x: any) => x === null;
    w.isBoolean ??= (x: any) => typeof x === 'boolean';
    w.isEmpty ??= (x: any) => x == null
      || (Array.isArray(x) && x.length === 0)
      || (typeof x === 'object' && Object.keys(x).length === 0);
  }

  public static async load(): Promise<CanvasXpressConstructor> {
    // Return cached constructor if already loaded
    if (this.cachedConstructor) {
      return this.cachedConstructor;
    }

    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Check environment
    if (typeof window === 'undefined') {
      throw new Error('CanvasXpress can only be loaded in browser environment');
    }

    // Check if already on window
    const w = window as any;
    if (w.CanvasXpress?.prototype) {
      const existing = w.CanvasXpress;
      this.cachedConstructor = existing;
      return existing;
    }

    // Create new load promise - dynamic imports for code splitting
    this.loadPromise = (async () => {
      this.setupGlobalShims();

      // Dynamic imports - only loaded when needed
      await import('canvasxpress/src/canvasXpress.css');
      await import('canvasxpress');

      const CX = (window as any).CanvasXpress;

      if (typeof CX !== 'function') {
        throw new Error('CanvasXpress failed to attach to window');
      }

      this.cachedConstructor = CX;
      return CX;
    })();

    try {
      return await this.loadPromise;
    } catch (error) {
      this.loadPromise = null; // Reset on failure to allow retry
      throw error;
    }
  }

  public static isLoaded(): boolean {
    return this.cachedConstructor !== null;
  }
}

// Main export - returns constructor directly
export async function loadCanvasXpress(): Promise<CanvasXpressConstructor> {
  return CanvasXpressLoader.load();
}
