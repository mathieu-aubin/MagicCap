// This code is a part of MagicCap which is a MPL-2.0 licensed project.
// Copyright (C) Jake Gealer <jake@gealer.email> 2018.
// Copyright (C) Rhys O'Kane <SunburntRock89@gmail.com> 2018.

const { shell, remote } = require("electron");
const $ = require("jquery");
const fsnextra = require("fs-nextra");
let config = require(`${require("os").homedir()}/magiccap.json`);
// Imports go here.

function openMPL() {
	shell.openExternal("https://www.mozilla.org/en-US/MPL/2.0");
}
// Opens the MPL 2.0 license in a browser.

function showAbout() {
	$("#about").addClass("is-active");
}
// Shows the about page.

$("#aboutClose").click(async() => {
	await $("#about").removeClass("is-active");
});
// Handles the about close button.

async function saveConfig() {
	fsnextra.writeJSON(`${require("os").homedir()}/magiccap.json`, config).catch(async() => {
		console.log("Could not update the config.");
	});
	for (const key in config) {
		remote.getGlobal("config")[key] = config[key];
	}
}
// Saves the config.

async function showClipboardAction() {
	let action = 2;
	if (config.clipboard_action) {
		if (config.clipboard_action <= 0 || config.clipboard_action >= 3) {
			config.clipboard_action = action;
			await saveConfig();
		} else {
			action = config.clipboard_action;
		}
	} else {
		config.clipboard_action = action;
		await saveConfig();
	}
	$(`#clipboardActionID${action}`).prop("checked", true);
	$("#clipboardAction").addClass("is-active");
}
// Shows the clipboard action settings page.

$("#clipboardActionClose").click(async() => {
	await $("#clipboardAction").removeClass("is-active");
});
// Handles the clipboard action close button.

$('[id^="clipboardActionID"]').click(async event => {
	const actionID = parseInt(event.target.id.substring(17));
	config.clipboard_action = actionID;
	await saveConfig();
});
// Handles clipboard action clicking.
