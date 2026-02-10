import { useState } from "react"

import { useGame } from "./game.store.ts"

export const ServerConnect = () => {
    const [url, setUrl] = useState("")
    const setServerUrl = useGame((state) => state.setServerUrl)

    const connect = async () => {
        try {
            const response = await fetch(`${url.trim()}/info`)
            if (!response.ok) {
                alert("Server responded with non-OK response")
                return
            }

            setServerUrl(url.trim())
        } catch {
            alert("Could not connect to the server")
        }
    }

    return (
        <div className="fixed inset-2 flex flex-col items-center justify-center gap-8 rounded-lg bg-neutral-900">
            <div className="flex flex-col items-center gap-2 rounded-lg bg-neutral-800 px-4 py-3">
                <h1 className="text-2xl font-bold">Have a server?</h1>
                <input
                    type="url"
                    className="rounded-sm bg-neutral-950 px-3 py-2 text-center text-neutral-50"
                    placeholder="Server URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button
                    className="cursor-pointer rounded-full bg-cyan-800 px-4 py-1 text-lg font-semibold text-cyan-50 hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={url.trim() === ""}
                    onClick={connect}
                >
                    Connect
                </button>
            </div>
        </div>
    )
}
