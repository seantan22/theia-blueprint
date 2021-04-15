import { PluginPackage } from '@theia/plugin-ext';
import { PluginVsCodeDirectoryHandler } from '@theia/plugin-ext-vscode/lib/node/plugin-vscode-directory-handler';
import { injectable } from 'inversify';
import * as path from 'path';

declare const __non_webpack_require__: typeof require;

@injectable()
export class BlueprintPluginVsCodeDirectoryHandler extends PluginVsCodeDirectoryHandler {

    protected requirePackage(pluginPath: string): PluginPackage | undefined {
        try {
            return __non_webpack_require__(path.join(pluginPath, 'package.json'));
        } catch {
            return undefined;
        }
    }
}
