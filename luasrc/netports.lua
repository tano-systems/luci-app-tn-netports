--
-- Copyright (c) 2018, Tano Systems. All Rights Reserved.
-- Anton Kikin <a.kikin@tano-systems.com>
--

module("luci.netports", package.seeall)

local app_version = "1.0.0"

local fs = require "nixio.fs"

function version()
	return app_version
end

local sysfs_net_root = "/sys/class/net"

local function sysfs_net_read(ifname, file)
	local v = nil
	if fs.access(sysfs_net_root .. "/%s/%s" % {ifname, file}) then
		v = fs.readfile(sysfs_net_root .. "/%s/%s" % {ifname, file})
		if v then
			v = v:gsub("\n", "")
		end
	end
	return v or ''
end

local function sysfs_net_read_stats(ifname)
	local s = {
		tx_bytes   = tonumber(sysfs_net_read(ifname, "statistics/tx_bytes")) or 0,
		tx_packets = tonumber(sysfs_net_read(ifname, "statistics/tx_packets")) or 0,
		rx_bytes   = tonumber(sysfs_net_read(ifname, "statistics/rx_bytes")) or 0,
		rx_packets = tonumber(sysfs_net_read(ifname, "statistics/rx_packets")) or 0,
	}

	return s
end

local function sysfs_net_read_bridge(ifname)
	local b = { }

	-- Bridge port number
	b["port"] = tonumber(sysfs_net_read(ifname, "brport/port_no")) or 0

	if b["port"] == 0 then
		return nil
	end

	-- Get bridge system interface name
	local b_path = fs.readlink(sysfs_net_root .. "/%s/brport/bridge" % ifname)
	if b_path then
		b["ifname"] = fs.basename(b_path)
	end

	return b
end

local function get_ntm_info(netlist, ifname)
	local info = { fwzone_color = "#EEEEEE" }

	for _, net in ipairs(netlist) do
		for idx, dev in ipairs(net.ifaces) do
			if dev:name() == ifname then
				info["netname"] = net.name
				if net.fwzone then
					info["fwzone"]       = net.fwzone:name()
					info["fwzone_color"] = net.fwzone:get_color()
					info["fwzone_sid"]   = net.fwzone.sid
				end
				return info
			end
		end
	end

	return info
end


function ports()
	local ports = {}
	local netlist = {}

	local util = require("luci.util")
	local uci  = require("luci.model.uci").cursor()
	local ntm  = require("luci.model.network").init()
	local fwm  = require("luci.model.firewall").init()

	for _, net in ipairs(ntm:get_networks()) do
		local ifaces = { net:get_interface() }

		netlist[#netlist + 1] = {
			name   = net:name(),
			fwzone = fwm:get_zone_by_network(net:name()),
			ifaces = ifaces
		}
	end

	uci:foreach("luci_netports", "port",
		function(section)
			if section["disable"] and (section["disable"] == "true"
				or tonumber(section["disable"]) == 1) then
				-- Disabled in config
				return true
			end

			if not fs.access("/sys/class/net/%s/ifindex" % section["ifname"]) then
				-- Invalid or not existent interface name
				return true
			end

			local new_port = { }
			local ifname = section["ifname"]
			local type   = section["type"]

			local knowntypes = {
				"copper",
				"fixed",
				"usb", -- deprecated
				"usb_stick",
				"usb_rndis",
				"usb_2g",
				"usb_3g",
				"usb_4g",
				"usb_wifi",
				"wifi"
			}

			if type == "usb" then
				type = "usb_rndis"
			end

			if type == "usb_2g" or
			   type == "usb_3g" or
			   type == "usb_4g" then
				type = "usb_stick"
			end

			if type == "usb_wifi" then
				type = "wifi"
			end

			if not util.contains(knowntypes, type) then
				type = "copper"
			end

			-- Port config parameters
			new_port["ifname"] = ifname
			new_port["type"]   = type
			new_port["name"]   = section["name"]

			if not new_port["name"] or new_port["name"] == "" then
				new_port["name"] = ifname
			end

			-- General port interface parameters
			new_port["hwaddr"]  = sysfs_net_read(ifname, "address")
			new_port["carrier"] = tonumber(sysfs_net_read(ifname, "carrier")) or 0

			-- unknown, notpresent, down, lowerlayerdown, testing, dormant, up
			new_port["operstate"] = sysfs_net_read(ifname, "operstate")

			-- up or down
			local flags = sysfs_net_read(ifname, "flags")
			if tonumber(flags) & 1 == 1 then
				new_port["adminstate"] = "up"
			else
				new_port["adminstate"] = "down"
			end

			if new_port["carrier"] > 0 then
				-- full, half
				new_port["duplex"] = sysfs_net_read(ifname, "duplex")

				-- Value is an integer representing the link speed in Mbits/sec
				new_port["speed"] = tonumber(sysfs_net_read(ifname, "speed")) or 0
			end

			-- Port interface statistics
			new_port["stats"] = sysfs_net_read_stats(ifname)

			-- Bridge parameters
			new_port["bridge"] = sysfs_net_read_bridge(ifname)

			-- Parameters for/from netifd
			new_port["ntm"] = get_ntm_info(netlist, ifname)

			if new_port["bridge"] then
				new_port["ntm_bridge"] = get_ntm_info(
					netlist, new_port["bridge"].ifname)
			end

			ports[#ports + 1] = new_port
		end)

	return ports
end
