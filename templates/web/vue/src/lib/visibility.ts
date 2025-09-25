import { ref, onMounted, onUnmounted } from 'vue';
import { on, request } from './fivem';

const isVisible = ref(false);

export function useVisibility() {
    const setVisibility = (visible: boolean) => {
        isVisible.value = visible;
    };

    const closeUI = async () => {
        try {
            await request('ui.close', {});
        } catch (error) {
            console.error('Failed to close UI:', error);
        }
    };

    onMounted(() => {
        const unsubscribe = on('ui.visibility', (payload) => {
            setVisibility(payload.visible);
        });

        onUnmounted(() => {
            unsubscribe();
        });
    });

    return {
        isVisible,
        setVisibility,
        closeUI,
    };
}
