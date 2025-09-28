declare module "react-native-background-timer" {
  export function setInterval(callback: () => void, interval: number): number;
  export function clearInterval(timerId: number): void;
  export function setTimeout(callback: () => void, timeout: number): number;
  export function clearTimeout(timerId: number): void;
  export function runBackgroundTimer(callback: () => void, interval: number): void;
  export function stopBackgroundTimer(): void;
}
