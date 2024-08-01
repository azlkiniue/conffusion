import { writable } from "svelte/store";

export const base = writable<string>('');
export const added = writable<Array<string>>(['']);
export const merged = writable<string>('');