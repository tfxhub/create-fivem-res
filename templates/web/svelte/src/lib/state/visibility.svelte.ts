import { on } from '../fivem';

let visible = $state(false);

export function isVisible() {
    return visible;
}

export function hide() {
    visible = false;
}

export function show() {
    visible = true;
}

export function toggle() {
    visible = !visible;
}

on('ui.visibility', ({ visible: v }) => {
    visible = v;
});
