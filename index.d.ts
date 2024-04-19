import type * as FigmaPluginNS from '@figma/plugin-typings';
import * as MgPluginNS from '@mastergo/plugin-typings';
declare global {
    interface Window {
        figma: typeof FigmaPluginNS;
        mg: typeof MgPluginNS;
    }
}
