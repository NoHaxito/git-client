import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getHostFromUrl(url: string) {
  return new URL(url).host;
}

export function parseRemoteOrigin(origin: string) {
  return origin.replace(".git", "");
}
