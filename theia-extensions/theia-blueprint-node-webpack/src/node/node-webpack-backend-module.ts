import { PluginVsCodeDirectoryHandler } from '@theia/plugin-ext-vscode/lib/node/plugin-vscode-directory-handler';
import { ContainerModule } from 'inversify';
import { BlueprintPluginVsCodeDirectoryHandler } from './blueprint-plugin-vscode-directory-handler';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    rebind(PluginVsCodeDirectoryHandler).to(BlueprintPluginVsCodeDirectoryHandler).inSingletonScope();
});
