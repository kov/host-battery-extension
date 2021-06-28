/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */
/* exported init, buildPrefsWidget */

/*
 * SshHostBattery is Copyright © 2021 Gustavo Noronha Silva
 *
 * This file is part of SshHostBattery.
 *
 * SshHostBattery is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * SshHostBattery is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with SshHostBattery. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

const { Gio, GObject, Gtk, GLib } = imports.gi;

const Gettex = imports.gettext.domain('br.dev.kov.SshHostBattery');
const _ = Gettex.gettext;

const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();

const Convenience = Me.imports.extensionUtils;

function init() {
    Convenience.initTranslations();
}

const SshHostBatteryPrefsWidget = class SshHostBatteryPrefsWidget {
    constructor() {
        this.main_widget = new Gtk.Notebook({
            margin: 12
        });

        // Settings
        this._settings = Convenience.getSettings();

        this.main_widget.show_all();
    }
}

function buildPrefsWidget() {
    let widget = new SshHostBatteryPrefsWidget();

    return widget.main_widget;
}
