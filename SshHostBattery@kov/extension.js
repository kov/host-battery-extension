/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */
/* exported init, enable, disable */

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

const { St, GObject, GLib, Shell, Gio, Clutter } = imports.gi;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;

const Util = imports.misc.util;
const Config = imports.misc.config;
const ExtensionUtils = imports.misc.extensionUtils;

const Gettext = imports.gettext.domain('br.dev.kov.SshHostBattery');
const _ = Gettext.gettext;

const Me = ExtensionUtils.getCurrentExtension();

const IndicatorName = Me.metadata['name'];

const SHELL_MINOR = parseInt(Config.PACKAGE_VERSION.split('.')[1]);
const INTERVAL = 60;

var SshHostBatteryIndicator = null;

const SshHostBattery = GObject.registerClass(
    class SshHostBattery extends PanelMenu.Button {
        _init(params) {
            super._init(params, IndicatorName);

            // Create UI
            this.box = new St.BoxLayout();

            // Icon
            this.batteryIco = new St.Icon({
                gicon: Gio.icon_new_for_string('/usr/share/icons/Adwaita/scalable/legacy/battery-full-symbolic.svg'),
                style_class: 'system-status-icon'
            });

            // Label
            this.battery = new St.Label({
                y_align: Clutter.ActorAlign.CENTER,
                text: '--',
                style_class: 'label'
            });

            this.box.add(this.batteryIco);
            this.box.add(this.battery);
            this.actor.add_actor(this.box);

            /** ### Setup Refresh Timer ### **/
            this.timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, INTERVAL, this._refresh.bind(this));
        }

        destroy() {
            if (this.timer) {
                GLib.source_remove(this.timer);
                this.timer = null;
            }

            super.destroy();
        }

        /*********************/

        _refresh() {
              const command = ['ssh', 'gustavos-macbook-air.local', 'host-battery-status'];
              try {
                  let proc = Gio.Subprocess.new( command, Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE );
                  // The callback is a force exit as there is no need for process communication
                  proc.communicate_utf8_async(null, null, (proc, res) => {
                      try {
                          let [, stdout, stderr] = proc.communicate_utf8_finish(res);

                          if (proc.get_successful()) {
                              this.battery.text = stdout;
                          } else {
                              log(stderr);
                              this.battery.text = 'FAIL';
                          }
                      } catch (e) {
                          logError(e);
                      }
                  });
              } catch (e) {
                  logError(e);
              }
            return GLib.SOURCE_CONTINUE;
        }
    }
);

function init() {
}

function enable() {
    SshHostBatteryIndicator = new SshHostBattery();
    Main.panel.addToStatusArea(IndicatorName, SshHostBatteryIndicator);
}

function disable() {
    if (SshHostBatteryIndicator !== null) {
        SshHostBatteryIndicator.destroy();
        SshHostBatteryIndicator = null;
    }
}
