import type {
    NuiToClientRequestData,
    NuiToClientRequestName,
    NuiToClientResponseData,
    ClientToNuiEventMap,
    ClientToNuiEventName,
    ClientToNuiEventPayload,
} from '@commonTypes/nui';

const RESOURCE_NAME = GetParentResourceName?.() ?? 'nui://game';

/**
 * Listen for typed messages sent from client via SendNuiMessage
 * @param event
 * @param handler
 * @returns
 */
export function on<E extends ClientToNuiEventName>(
    event: E,
    handler: (payload: ClientToNuiEventPayload<E>) => void,
): () => void {
    function listener(ev: MessageEvent) {
        const data = (ev?.data ?? {}) as { type?: string } & Partial<ClientToNuiEventMap[E]>;
        if (data?.type === event) {
            handler(data as ClientToNuiEventPayload<E>);
        }
    }
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
}

/**
 * Perform typed request to FiveM client via fetch NUI callback
 * @param event
 * @param data
 * @returns
 */
export async function request<E extends NuiToClientRequestName>(
    event: E,
    data: NuiToClientRequestData<E>,
): Promise<NuiToClientResponseData<E>> {
    const url = `https://${RESOURCE_NAME}/${event}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data),
    });
    try {
        return (await res.json()) as NuiToClientResponseData<E>;
    } catch {
        // Some handlers may not respond; align with FiveM default behavior returning empty
        return undefined as unknown as NuiToClientResponseData<E>;
    }
}
