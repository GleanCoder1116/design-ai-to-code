import * as FigmaPluginNS from '@figma/plugin-typings';
import * as MgPluginNS from '@mastergo/plugin-typings';

declare global {
    // 假设FigmaPluginNS和MgPluginNS有可以被赋给figma和mg的类型
    // 这通常不是实际情况，因为通常你会从命名空间中导入特定的类型
    // 这里仅为演示如何将整个命名空间附加到Window上
    interface Window {
        figma: typeof FigmaPluginNS;
        mg: typeof MgPluginNS;
    }
}