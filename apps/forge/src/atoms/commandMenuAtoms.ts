// @/store/command-menu.ts
import { atom } from "jotai";

export const commandMenuIsOpenAtom = atom(false);
commandMenuIsOpenAtom.debugLabel = "commandMenu:isOpen";
