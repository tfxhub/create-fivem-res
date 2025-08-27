import prompts from 'prompts';
import kleur from 'kleur';
import { FormatterLinterTool, FORMATTER_LINTER_TOOLS } from './config.js';

export interface ToolSelectionResult {
    selectedTools: FormatterLinterTool[];
    hasFormatting: boolean;
    hasLinting: boolean;
}

/**
 * Prompts user to select formatter/linter tools
 * @returns Selected tools and capabilities
 */
export async function selectFormatterLinterTools(): Promise<ToolSelectionResult> {
    const choices = [
        {
            title: `${kleur.green('Biome.js')} ${kleur.gray('(recommended)')}`,
            description: 'All-in-one formatter and linter',
            value: 'biomejs',
        },
        {
            title: kleur.blue('Prettier'),
            description: 'Code formatter',
            value: 'prettier',
        },
        {
            title: kleur.gray('None'),
            description: 'Skip formatter and linter setup',
            value: 'none',
        },
    ];

    const response = await prompts({
        type: 'select',
        name: 'toolChoice',
        message: 'Choose formatter/linter tools:',
        choices,
        initial: 0,
    });

    if (!response.toolChoice) {
        console.log(kleur.yellow('👋 Operation cancelled'));
        process.exit(0);
    }

    const selectedTools: FormatterLinterTool[] = [];
    let hasFormatting = false;
    let hasLinting = false;

    switch (response.toolChoice) {
        case 'biomejs':
            const biomeTool = FORMATTER_LINTER_TOOLS.find((tool) => tool.id === 'biomejs')!;
            selectedTools.push(biomeTool);
            hasFormatting = true;
            hasLinting = true;
            break;

        case 'prettier':
            const prettierTool = FORMATTER_LINTER_TOOLS.find((tool) => tool.id === 'prettier')!;
            selectedTools.push(prettierTool);
            hasFormatting = true;
            break;

        case 'none':
            break;
    }

    return {
        selectedTools,
        hasFormatting,
        hasLinting,
    };
}
