import kleur from 'kleur';
import prompts from 'prompts';
import { OPTIONAL_FEATURES, type OptionalFeature } from './config.js';

export interface FeatureSelectionResult {
    selectedFeatures: OptionalFeature[];
    hasFormatting: boolean;
    hasLinting: boolean;
    wantTailwind: boolean;
}

/**
 * Prompts user to select optional features
 * @returns Selected features and capabilities
 */
export async function selectOptionalFeatures(
    uiFramework: 'react' | 'vue' | 'svelte' | 'none' = 'none',
): Promise<FeatureSelectionResult> {
    const choices = OPTIONAL_FEATURES.filter((feature) => !feature.isUIrequired || uiFramework !== 'none').map(
        (feature) => ({
            title: feature.isUIrequired ? kleur.cyan(feature.name) : kleur.blue(feature.name),
            description: feature.description,
            value: feature.id,
        }),
    );

    const response = await prompts({
        type: 'multiselect',
        name: 'featureChoices',
        message: 'Select optional features (Space to select, Enter to confirm):',
        choices,
        instructions: false,
        min: 0,
    });

    if (response.featureChoices === undefined) {
        console.log(kleur.yellow('👋 Operation cancelled'));
        process.exit(0);
    }

    const selectedFeatures: OptionalFeature[] = [];
    let hasFormatting = false;
    let hasLinting = false;
    let wantTailwind = false;

    const choicesArray: string[] = Array.isArray(response.featureChoices) ? response.featureChoices : [];

    for (const choice of choicesArray) {
        const feature = OPTIONAL_FEATURES.find((f) => f.id === choice);
        if (feature) {
            selectedFeatures.push(feature);
            if (feature.id === 'prettier') {
                hasFormatting = true;
            }
            if (feature.id === 'tailwind') {
                wantTailwind = true;
            }
        }
    }

    hasLinting = selectedFeatures.some((feature) => Boolean(feature.scripts?.lint));

    return {
        selectedFeatures,
        hasFormatting,
        hasLinting,
        wantTailwind,
    };
}
