--
-- Copyright (c) 2018, Tano Systems. All Rights Reserved.
-- Anton Kikin <a.kikin@tano-systems.com>
--

module("luci.controller.netports", package.seeall)

local np = require "luci.netports"

function index()
	-- Actions
	entry({"admin", "network", "netports_info"},
		call("netports_get_info"))
end

--

function netports_get_info()
	local ports = np.ports()
	luci.http.prepare_content("application/json")
	luci.http.write_json(ports)
end
