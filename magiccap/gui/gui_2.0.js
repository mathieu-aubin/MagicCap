// This code is a part of MagicCap which is a MPL-2.0 licensed project.
// Copyright (C) Jake Gealer <jake@gealer.email> 2018-2019.
// Copyright (C) Rhys O'Kane <SunburntRock89@gmail.com> 2018.

const $ = require("jquery/dist/jquery.slim");
const { ipcRenderer, remote, shell } = require("electron");
const { readdir, writeJSON } = require("fs-nextra");
let config = require(`${require("os").homedir()}/magiccap.json`);
// The needed imports.

document.getElementById("magiccap-ver").innerText = `MagicCap v${remote.app.getVersion()}`;
// Sets the MagicCap version.

if (config.light_theme) {
    $("head").append(`<link rel="stylesheet" type="text/css" href="../node_modules/bulmaswatch/default/bulmaswatch.min.css">`);
    $("#sidebar").css("background-color", "#e6e6e6");
} else {
    $("head").append(`<link rel="stylesheet" type="text/css" href="../node_modules/bulmaswatch/darkly/bulmaswatch.min.css">`);
    $("#sidebar").css("background-color", "#171819");
}
// Changes the colour scheme.

let db = remote.getGlobal("captureDatabase");
// Defines the DB.

let displayedCaptures = [];
// A list of the displayed captures.

async function getCaptures() {
    displayedCaptures.length = 0;
    await db.each("SELECT * FROM captures ORDER BY timestamp DESC LIMIT 20", (err, row) => {
        if (err) { console.log(err); }
        displayedCaptures.push(row);
    });
};
getCaptures();
// Handles each capture.

new Vue({
    el: "#mainTableBody",
    data: {
        captures: displayedCaptures,
        successMap: {
            0: "Failure",
            1: "Success",
        },
    },
    methods: {
        rmCapture: async timestamp => {
            await db.run(
                "DELETE FROM captures WHERE timestamp = ?",
                [timestamp],
            );
            await getCaptures();
        },
        openScreenshotURL: async url => {
            await shell.openExternal(url);
        },
        openScreenshotFile: async filePath => {
            await shell.openItem(filePath);
        },
    },
});
// Handles the upload list.

let clipboardAction = 2;
if (config.clipboard_action) {
	if (config.clipboard_action <= 0 || config.clipboard_action >= 3) {
		config.clipboard_action = clipboardAction;
		saveConfig();
	} else {
		clipboardAction = config.clipboard_action;
	}
} else {
	config.clipboard_action = clipboardAction;
	saveConfig();
}
// Defines the clipboard action.

new Vue({
    el: "#clipboardAction",
    data: {
        action: clipboardAction,
    },
    methods: {
        changeAction: async action => {
            config.clipboard_action = action;
            await saveConfig();
        },
    },
});
// Handles the clipboard actions.

$("#clipboardActionClose").click(async() => {
	await $("#clipboardAction").removeClass("is-active");
});
// Handles the clipboard action close button.

function showClipboardAction() {
	$("#clipboardAction").addClass("is-active");
}
// Shows the clipboard action settings page.

ipcRenderer.on("screenshot-upload", async () => {
    await getCaptures();
});
// Handles new screenshots.

async function runCapture() {
	await remote.getGlobal("runCapture")();
}
// Runs the fullscreen capture.

async function runWindowCapture() {
	await remote.getGlobal("runCapture")(true);
}
// Runs the window capture.

window.onload = async() => {
	await $("body").show();
	ipcRenderer.send("window-show");
};
// Unhides the body/window when the page has loaded.

function showAbout() {
	$("#about").addClass("is-active");
}
// Shows the about page.

$("#aboutClose").click(async() => {
	await $("#about").removeClass("is-active");
});
// Handles the about close button.

function openMPL() {
	shell.openExternal("https://www.mozilla.org/en-US/MPL/2.0");
}
// Opens the MPL 2.0 license in a browser.

async function saveConfig() {
	writeJSON(`${require("os").homedir()}/magiccap.json`, config).catch(async() => {
		console.log("Could not update the config.");
	});
	ipcRenderer.send("config-edit", config);
}
// Saves the config.

async function toggleTheme() {
	config.light_theme = !config.light_theme;
	await saveConfig();
	location.reload();
}
// Toggles the theme.

function showHotkeyConfig() {
	$("#hotkeyConfig").addClass("is-active");
}
// Shows the hotkey config.

$("#hotkeyConfigClose").click(async() => {
	const text = await $("#screenshotHotkey").val();
	const windowText = await $("#windowScreenshotHotkey").val();
	if (config.hotkey !== text) {
		if (text === "") {
			ipcRenderer.send("hotkey-unregister");
			config.hotkey = null;
			await saveConfig();
		} else {
			ipcRenderer.send("hotkey-unregister");
			config.hotkey = text;
			await saveConfig();
			ipcRenderer.send("hotkey-change", text);
		}
		if (config.window_hotkey) {
			ipcRenderer.send("window-hotkey-change", config.window_hotkey);
		}
	}
	if (config.window_hotkey !== windowText) {
		if (windowText === "") {
			ipcRenderer.send("hotkey-unregister");
			config.window_hotkey = null;
			await saveConfig();
		} else {
			ipcRenderer.send("hotkey-unregister");
			config.window_hotkey = windowText;
			await saveConfig();
			ipcRenderer.send("window-hotkey-change", windowText);
		}
		if (config.hotkey) {
			ipcRenderer.send("hotkey-change", config.hotkey);
		}
	}
	await $("#hotkeyConfig").removeClass("is-active");
});
// Allows you to close the hotkey config.

function openAcceleratorDocs() {
	shell.openExternal("https://electronjs.org/docs/api/accelerator");
}
// Opens the Electron accelerator documentation.

new Vue({
    el: "#hotkeyConfigBody",
    data: {
        screenshotHotkey: config.hotkey || "",
        windowHotkey: config.window_hotkey || "",
    },
});
// Handles rendering the hotkey config body.

new Vue({
    el: "#fileConfig",
    data: {
        fileConfigCheckboxI: config.save_capture || false,
        fileNamingPatternI: config.file_naming_pattern || "screenshot_%date%_%time%",
        fileSaveFolderI: config.save_path,
    },
    methods: {
        saveItem: function (key, configKey, not, path) {
            if (path) {
                let slashType;
                switch (process.platform) {
                    case "darwin":
                    case "linux": {
                        slashType = "/";
                        break;
                    }
                    case "win32": {
                        slashType = "\\";
                    }
                }
                if (!this[key].endsWith(slashType)) {
                    this[key] += slashType;
                }
            }
            if (not) {
                this[key] = !this[key];
            }
            config[configKey] = this[key];
            saveConfig();
        },
    },
});
// Handles the file config.

function showFileConfig() {
	$("#fileConfig").addClass("is-active");
}
// Shows the file config.

$("#fileConfigClose").click(async() => {
	await $("#fileConfig").removeClass("is-active");
});
// Closes the file config.

const activeUploaderConfig = new Vue({
    el: "#activeUploaderConfig",
    data: {
        uploader: {
            name: "",
            options: {},
        },
    },
    methods: {
        getDefaultValue: function (option) {
            if (config[option.value]) {
                return config[option.value];
            }
            if (option.default !== undefined) {
                return option.default;
            }
            return "";
        },
        changeOption: function (option) {
            const res = document.getElementById(option.value).value;
            if (res === "") {
                res = undefined;
            }
            if (option.type === "integer") {
                res = parseInt(res) || option.default || undefined;
            }
            config[option.value] = res;
            saveConfig();
        },
        deleteRow: function (key, option) {
            delete option.items[key];
            config[option.value] = option.items;
            saveConfig();
        },
        addToTable: function (option) {
            clearActiveUploaderErrors();
            const key = document.getElementById(`Key${option.value}`).value || "";
            const value = document.getElementById(`Value${option.value}`).value || "";
            if (key === "") {
                return throwActiveUploaderError("blankKey");
            }
            if (option.items[key] !== undefined) {
                return throwActiveUploaderError("keyAlreadyUsed");
            }
            option.items[key] = value;
            config[option.value] = option.items;
            saveConfig();
        },
    }
});
// Defines the active uploader config.

function showUploaderConfig() {
	$("#uploaderConfig").addClass("is-active");
}
// Shows the uploader config page.

importedUploaders = ipcRenderer.sendSync("get-uploaders");
// All of the imported uploaders.

new Vue({
    el: "#uploaderConfigBody",
    data: {
        uploaders: importedUploaders,
    },
    methods: {
        renderUploader: function (uploader, uploaderKey) {
            const options = {};
            for (const optionKey in uploader.config_options) {
                const option = uploader.config_options[optionKey];
                switch (option.type) {
                    case "text":
                    case "integer":
                    case "password":
                        options[optionKey] = {
                            type: option.type,
                            value: option.value,
                            default: option.default,
                            required: option.required,
                        };
                        break;
                    case "object":
                        options[optionKey] = {
                            type: option.type,
                            value: option.value,
                            default: option.default,
                            required: option.required,
                            items: config[option.type] || {},
                        };
                        break;
                }
            }
            activeUploaderConfig.$set(activeUploaderConfig.uploader, "name", uploaderKey);
            activeUploaderConfig.$set(activeUploaderConfig.uploader, "options", options);
            document.getElementById("uploaderConfig").classList.remove("is-active");
            document.getElementById("activeUploaderConfig").classList.add("is-active");
        },
    },
});
// Renders all of the uploaders.
