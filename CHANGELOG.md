# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

All dates in this document are in `DD.MM.YYYY` format.

## Unreleased
### Added
- This CHANGELOG file.
- Handling cases when the firewall zones are assigned to both the network
  interface and the bridge of which the interface is a member. In this case,
  information about both firewall zones is displayed.
- Hide additional information toggle button before first data is arrived.
- Handling of the operative interface state from `/sys/class/net/<if>/operstate`
  sysfs file.

### Changed
- Renamed application section title from "Ports Status" to "Network Interfaces
  Ports Status"
- Icons moved to `icons` subdirectory.
- Place application on the "Overview" page after "Memory" section.
  This became possible after applying patch to LuCI from pull request
  [2359](https://github.com/openwrt/luci/pull/2359).

### Fixed
- Fix Russian translations for "Connected", "Disconnected" and "Disabled".

## 1.0.0 - 07.12.2018

Initial release
