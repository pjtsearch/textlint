import { TextLintModuleResolver } from "../engine/textlint-module-resolver";
import { moduleInterop } from "@textlint/module-interop";
import { TextlintPluginCreator, TextlintPluginOptions } from "@textlint/types";
const debug = require("debug")("textlint:plugin-loader");
const assert = require("assert");

/**
 * get plugin names from `configFileRaw` object
 * @param configFileRaw
 * @returns {Array}
 */
export function getPluginNames(configFileRaw: { plugins?: string[] | Record<string, unknown> }): string[] {
    const plugins = configFileRaw.plugins;
    if (!plugins) {
        return [];
    }
    if (Array.isArray(plugins)) {
        return plugins;
    }
    return Object.keys(plugins);
}

/**
 * get pluginConfig object from `configFileRaw` that is loaded .textlintrc
 * @param {Object} configFileRaw
 * @returns {Object}
 * @example
 * ```js
 * "plugins": {
 *   "pluginA": {},
 *   "pluginB": {}
 * }
 * ```
 *
 * to
 *
 * ```js
 * {
 *   "pluginA": {},
 *   "pluginB": {}
 * }
 * ```
 *
 *
 *
 * ```js
 * "plugins": ["pluginA", "pluginB"]
 * ```
 *
 * to
 *
 * ```
 * // `true` means turn on
 * {
 *   "pluginA": true,
 *   "pluginB": true
 * }
 * ```
 */
export function getPluginConfig(configFileRaw: {
    plugins?: string[] | { [index: string]: TextlintPluginOptions | undefined };
}): { [index: string]: boolean | TextlintPluginOptions | undefined } {
    const plugins = configFileRaw.plugins;
    if (!plugins) {
        return {};
    }
    if (Array.isArray(plugins)) {
        if (plugins.length === 0) {
            return {};
        }
        // { "pluginA": true, "pluginB": true }
        return plugins.reduce((results: Record<string, boolean>, pluginName) => {
            results[pluginName] = true;
            return results;
        }, {});
    }
    return plugins;
}

export function loadAvailableExtensions(pluginNames: string[] = [], moduleResolver: TextLintModuleResolver) {
    const availableExtensions: string[] = [];
    pluginNames.forEach((pluginName) => {
        const pkgPath = moduleResolver.resolvePluginPackageName(pluginName);
        const plugin: TextlintPluginCreator = moduleInterop(require(pkgPath));
        if (!plugin.hasOwnProperty("Processor")) {
            return;
        }
        const Processor = plugin.Processor;
        debug(`${pluginName} has Processor`);
        if (typeof Processor.availableExtensions === "function") {
            availableExtensions.push(...Processor.availableExtensions());
        } else {
            const instance = new Processor();
            assert.ok(
                typeof instance.availableExtensions === "function",
                "Processor.availableExtensions() should be implemented"
            );
            availableExtensions.push(...instance.availableExtensions());
        }
    });
    return availableExtensions;
}
