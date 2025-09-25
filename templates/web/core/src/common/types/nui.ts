// Common, shared event contracts between FiveM client and NUI
// These types are consumed by the UI for type-safety.

// Events map: FiveM Client -> NUI
export interface ClientToNuiEventMap {
    'ui.visibility': { visible: boolean };
    'ui.playerHealth': { health: number };
}

// Requests map: NUI -> FiveM Client
export interface NuiToClientRequestMap {
    'ui.close': {
        request: {};
        response: { ok: true } | { ok: false; error?: string };
    };
}

export type ClientToNuiEventName = keyof ClientToNuiEventMap;
export type NuiToClientRequestName = keyof NuiToClientRequestMap;

export type ClientToNuiEventPayload<E extends ClientToNuiEventName> = ClientToNuiEventMap[E];
export type NuiToClientRequestData<E extends NuiToClientRequestName> = NuiToClientRequestMap[E]['request'];
export type NuiToClientResponseData<E extends NuiToClientRequestName> = NuiToClientRequestMap[E]['response'];
