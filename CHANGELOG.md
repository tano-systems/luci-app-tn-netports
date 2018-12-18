# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

All dates in this document are in `DD.MM.YYYY` format.

## [Unreleased]
### Added
- This CHANGELOG file.
- Handling cases when the firewall zones are assigned to both the network
  interface and the bridge of which the interface is a member. In this case,
  information about both firewall zones is displayed.
- Hide additional information toggle button before first data is arrived.
- Added vertical table view mode. By default used new vertical mode. This may
  changed by the `global.default_h_mode` option in `/etc/config/luci_netports`
  configuration file. If used horizontal mode then view mode is automatically
  switched to vertical mode in case the number of interfaces is more than 6.
- Added "Switch to vertical/horizontal mode" button. By default this button
  is disabled (not shown). Button may be enabled by the `global.hv_mode_switch_button`
  option in `/etc/config/luci_netports` configuration file.
- Added example screenshots.

### Changed
- Renamed application section title from "Ports Status" to "Network Interfaces Ports Status"
- Icons moved to `icons` subdirectory.
- Place application on the "Overview" page after "Memory" section.
  This became possible after applying patch to LuCI from pull request
  [2364](https://github.com/openwrt/luci/pull/2364).
- Moved part of the JavaScript code to LuCI resources directory.
- Renamed "Network interface" parameter to "Interface" in the table.
- Renamed configuration parameter `global.hide_additional_info`
  to `global.default_additional_info`.

### Fixed
- Fix administrative down state detection.
- Fix port link status icon display in IE.
- Fix Russian translations for "Connected", "Disconnected" and "Disabled".
- Properly handling of the operative interface state from
  `/sys/class/net/<if>/operstate` sysfs file.

## [Version 1.0.0] (07.12.2018)

Initial release

[Unreleased]: https://github.com/tano-systems/luci-app-netports/tree/master
[Version 1.0.0]: https://github.com/tano-systems/luci-app-netports/releases/tag/v1.0.0
