import { create } from "zustand/react"

type StoreValue = {
    // TODO game stuff
}

export const useStore = create<StoreValue>()(() => ({}))
