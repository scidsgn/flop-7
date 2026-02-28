import { useMemo, useState } from "react"
import { z } from "zod"

import { Button } from "./button.tsx"
import { useGame } from "./game.store.ts"
import { Panel } from "./panel.tsx"
import { TextInput } from "./text-input.tsx"
import { useLocalStorage } from "./use-local-storage.ts"

const urlSchema = z.url()
const recentUrlsSchema = z.array(urlSchema)

export const ServerConnect = () => {
    const [recentUrls, setRecentUrls] = useLocalStorage(
        "flop-7-recent-urls",
        recentUrlsSchema,
        [],
    )

    const [url, setUrl] = useState("")
    const urlIsValid = useMemo(() => urlSchema.safeParse(url).success, [url])

    const setServerUrl = useGame((state) => state.setServerUrl)

    const connectToUrl = async (url: string) => {
        try {
            const response = await fetch(`${url}/info`)
            if (!response.ok) {
                alert("Server responded with non-OK response")
                return
            }

            setServerUrl(url)
            setRecentUrls(Array.from(new Set([url, ...recentUrls])))
        } catch {
            alert("Could not connect to the server")
        }
    }

    const connect = async () => {
        const trimmedUrl = url.endsWith("/") ? url.slice(0, -1) : url
        await connectToUrl(trimmedUrl)
    }

    return (
        <Panel className="grid grid-cols-2 gap-6">
            <div className="flex flex-col justify-between gap-6">
                <h1 className="text-4xl font-extrabold">Have a server?</h1>

                <div className="flex flex-col gap-3">
                    <p className="font-semibold text-neutral-500">
                        Recently connected servers:
                    </p>
                    {Array.from({ length: 3 }).map((_, i) => {
                        const url = recentUrls[i]

                        return url ? (
                            <Button
                                key={i}
                                className="text-left"
                                onClick={() => connectToUrl(url)}
                            >
                                {url}
                            </Button>
                        ) : (
                            <Button key={i} disabled />
                        )
                    })}
                </div>
            </div>
            <div className="flex flex-col gap-3 self-end">
                <TextInput
                    type="url"
                    placeholder="Server URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <Button
                    className="self-end"
                    primary
                    disabled={!urlIsValid}
                    onClick={connect}
                >
                    Connect
                </Button>
            </div>
        </Panel>
    )
}
