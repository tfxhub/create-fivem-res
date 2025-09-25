import { useEffect, useState } from 'react';
import { on, request } from '../lib/fivem';

export function useVisibility() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const off = on('ui.visibility', ({ visible }) => setVisible(visible));
        return off;
    }, []);

    const close = async () => {
        await request('ui.close', {});
    };

    return { visible, close } as const;
}
