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

'use strict'

const { St, GObject, GLib, Shell, Gio, Clutter } = imports.gi

const Main = imports.ui.main
const PanelMenu = imports.ui.panelMenu
const INTERVAL = 60
const INDICATOR_NAME = 'Host Battery Indicator'

var SshHostBatteryIndicator = null

const SshHostBattery = GObject.registerClass(
    class SshHostBattery extends PanelMenu.Button {
        _init(params) {
            super._init(params, INDICATOR_NAME)

            this.box = new St.BoxLayout()

            this.battery_icon = new St.Icon({
                gicon: Gio.icon_new_for_string('/usr/share/icons/Adwaita/scalable/status/battery-level-100-charged-symbolic.svg'),
                style_class: 'system-status-icon'
            })

            this.battery = new St.Label({
                y_align: Clutter.ActorAlign.CENTER,
                text: '--',
                style_class: 'label'
            })

            this.box.add(this.battery_icon)
            this.box.add(this.battery)
            this.actor.add_actor(this.box)

            // Our first refresh should be quick once we boot up, but then we fall into the
            // regular cadence.
            this.timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, this._first_refresh.bind(this))
            this.timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, INTERVAL, this._refresh.bind(this))
        }

        destroy() {
            if (this.timer) {
                GLib.source_remove(this.timer)
                this.timer = null
            }

            super.destroy()
        }

        _first_refresh() {
            this._refresh()
            return GLib.SOURCE_REMOVE
        }

        _refresh() {
            const command = ['ssh', 'gustavos-macbook-air.local', 'host-battery-status']
            try {
                let proc = Gio.Subprocess.new( command, Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE )
                proc.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    let [, stdout, stderr] = proc.communicate_utf8_finish(res)

                    if (proc.get_successful()) {
                            let number = stdout.replace('%', '')
                            let icon_path = '/usr/share/icons/Adwaita/scalable/status/'
                            if (number == '100') {
                                icon_path += 'battery-level-100-charged-symbolic.svg'
                            } else {
                                number = number.slice(0, 1) + '0'
                                icon_path += 'battery-level-' + number + '-symbolic.svg'
                            }
                            this.battery_icon.set_gicon(
                                Gio.icon_new_for_string(icon_path)
                            )
                            this.battery.text = stdout
                        } else {
                            log(stderr)
                            this.battery.text = 'FAIL'
                        }
                    } catch (e) {
                        logError(e)
                    }
                })
            } catch (e) {
                logError(e)
            }
            return GLib.SOURCE_CONTINUE
        }
    }
)

function init() {
}

function enable() {
    SshHostBatteryIndicator = new SshHostBattery()
    Main.panel.addToStatusArea(INDICATOR_NAME, SshHostBatteryIndicator)
}

function disable() {
    if (SshHostBatteryIndicator !== null) {
        SshHostBatteryIndicator.destroy()
        SshHostBatteryIndicator = null
    }
}
