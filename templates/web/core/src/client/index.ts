import { helloWorld } from '@common/index';
import { log } from '@common/utils';
import { nui } from './nui';

on('onClientResourceStart', (name: string) => {
    if (name !== GetCurrentResourceName()) return;

    log.info('Client script started.');

    log.debug(helloWorld());
});

RegisterCommand(
    'openui',
    () => {
        nui.send('ui.visibility', { visible: true });
        SetNuiFocus(true, true);
    },
    false,
);

nui.onRequest('ui.close', async () => {
    nui.send('ui.visibility', { visible: false });
    SetNuiFocus(false, false);
    return { ok: true } as const;
});
