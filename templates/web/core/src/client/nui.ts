import { log } from '@common/utils';
import type {
    NuiToClientRequestData,
    NuiToClientRequestName,
    NuiToClientResponseData,
    ClientToNuiEventMap,
    ClientToNuiEventName,
    ClientToNuiEventPayload,
} from '@common/types/nui';

/**
 * Sends a typed UI event to the NUI window via SendNuiMessage
 * @param event
 * @param data
 */
export function send<E extends ClientToNuiEventName>(event: E, data: ClientToNuiEventPayload<E>): void {
    const message = JSON.stringify({ type: event, ...data });
    SendNuiMessage(message);
}

/**
 * Register a typed NUI callback request handler
 * @param event
 * @param handler
 */
export function onRequest<E extends NuiToClientRequestName>(
    event: E,
    handler: (data: NuiToClientRequestData<E>) => Promise<NuiToClientResponseData<E>> | NuiToClientResponseData<E>,
): void {
    RegisterNuiCallbackType(event);
    on(`__cfx_nui:${event}`, async (data: unknown, cb: (response: unknown) => void) => {
        try {
            const typedData = data as NuiToClientRequestData<E>;
            const result = await handler(typedData);
            cb(result);
        } catch (e) {
            log.error('NUI handler error for', event, e);
            cb({ ok: false, error: (e as Error)?.message ?? 'unknown' });
        }
    });
}

export type { ClientToNuiEventMap };

export const nui = {
    send,
    onRequest,
};
