import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes, letting later classes override earlier ones (e.g. w-full → w-40). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
