<template>
    <div class="columns is-gapless">
        <aside class="column aside" id="sidebar">
            <aside class="menu">
                <ul class="menu-list">
                    <li>
                        <a
                            @click="toggleCoreModal('Captures')"
                            :data-tooltip="_('View all your previous captures')"
                            data-tooltip-position="right">
                            <i class="far fa-images"></i> {{ _('Capture History') }}</a>
                    </li>
                    <li>
                        <a
                            @click="toggleCoreModal('ClipboardAction')"
                            data-tooltip="Control what will be on your clipboard after capture"
                            data-tooltip-position="right">
                            <i class="far fa-clipboard"></i> {{ _('Clipboard Action') }}</a>
                    </li>
                    <li>
                        <a
                            @click="toggleCoreModal('FileConfig')"
                            data-tooltip="Configure capture file naming and local file saving"
                            data-tooltip-position="right">
                                <i class="far fa-file-alt"></i> File Configuration</a>
                    </li>
                    <li>
                        <a
                            @click="toggleCoreModal('HotkeySettings')"
                            data-tooltip="Define hotkeys to trigger capture actions"
                            data-tooltip-position="right">
                            <i class="far fa-keyboard"></i> Hotkey Settings</a>
                    </li>
                    <li>
                        <a
                            @click="toggleCoreModal('UploaderConfig')"
                            data-tooltip="Enable uploading captures and configure the upload target"
                            data-tooltip-position="right">
                            <i class="fas fa-upload"></i> Uploader Settings</a>
                    </li>

                    <li><hr/></li>

                    <li>
                        <a
                            @click="toggleCoreModal('About')"
                            data-tooltip="View the version and authors"
                            data-tooltip-position="right">
                            <i class="fas fa-info"></i> About</a>
                    </li>
                    <li>
                        <a
                            @click="toggleCoreModal('Updates')"
                            data-tooltip="Check for updates and toggle receiving beta updates"
                            data-tooltip-position="right">
                            <i class="fas fa-cogs"></i> Updates</a>
                    </li>
                    <li>
                        <a
                            @click="toggleTheme"
                            data-tooltip="Switch between light and dark mode"
                            data-tooltip-position="right">
                            <i class="fas fa-palette"></i> Toggle Theme</a>
                    </li>
                    <li>
                        <a
                            @click="toggleCoreModal('Docs')"
                            data-tooltip="Read the help documentation for the app"
                            data-tooltip-position="right">
                                <i class="fas fa-book"></i> Help (Docs)</a>
                    </li>

                    <li><hr/></li>

                    <li>
                        <a
                            @click="runRemoteAction(0)"
                            data-tooltip="Shorten links using s.magiccap.me"
                            data-tooltip-position="right">
                            <i class="fas fa-link"></i> Link Shortener</a>
                    </li>
                    <li>
                        <a
                            @click="runRemoteAction(1)"
                            data-tooltip="Run the screen capture tool in MagicCap"
                            data-tooltip-position="right">
                            <i class="fas fa-camera"></i> Screen Capture</a>
                    </li>
                    <li>
                        <a
                            @click="runRemoteAction(2)"
                            data-tooltip="Capture a GIF recording of the screen"
                            data-tooltip-position="right">
                            <i class="fas fa-video"></i> GIF Capture</a>
                    </li>
                    <li>
                        <a
                            @click="runRemoteAction(3)"
                            data-tooltip="Capture the current image on your clipboard"
                            data-tooltip-position="right">
                            <i class="fas fa-clipboard-check"></i> Clipboard Capture</a>
                    </li>
                </ul>
            </aside>
        </aside>
        <Captures ref="Captures"></Captures>
        <ClipboardAction ref="ClipboardAction"></ClipboardAction>
        <FileConfig ref="FileConfig"></FileConfig>
        <HotkeySettings ref="HotkeySettings"></HotkeySettings>
        <UploaderConfig ref="UploaderConfig"></UploaderConfig>
        <Debug ref="Debug"></Debug>
        <About ref="About" @debug-show="toggleCoreModal('Debug')"></About>
        <Updates ref="Updates"></Updates>
        <Docs ref="Docs"></Docs>
    </div>
</template>

<script lang="ts">
    import Vue from "vue"
    import saveConfig from "../save_config"
    import { ipcRenderer, remote } from "electron"
    import Captures from "./captures"
    import ClipboardAction from "./clipboard_action"
    import FileConfig from "./file_configuration"
    import HotkeySettings from "./hotkey_settings"
    import UploaderConfig from "./uploader_config"
    import About from "./about"
    import Debug from "./debug"
    import Updates from "./updates"
    import Docs from "./docs"

    declare global {
        interface Window {
            config: {
                saveConfig: () => void,
                o: any,
            },
        }
    }

    export default Vue.extend({
        name: "App",
        components: {
            Captures,
            ClipboardAction,
            FileConfig,
            HotkeySettings,
            UploaderConfig,
            About,
            Debug,
            Updates,
            Docs,
        },
        data() {
            return {
                default: "Captures",
            }
        },
        methods: {
            _(text: string) {
                return text
            },
            toggleCoreModal(name: string) {
                (this.$refs[this.$data.default] as any).toggle();
                (this.$refs[name] as any).toggle();
                this.$data.default = name
            },
            toggleTheme() {
                window.config.o.light_theme = !window.config.o.light_theme
                saveConfig()
                ipcRenderer.send("restartWindow")
            },
            runRemoteAction(action: Number) {
                if (action === 0) {
                    ipcRenderer.send("show-short")
                } else if (action === 1) {
                    remote.getGlobal("runCapture")()
                } else if (action === 2) {
                    remote.getGlobal("runCapture")(true)
                } else if (action === 3) {
                    remote.getGlobal("runClipboardCapture")()
                }
            },
        },
    })
</script>