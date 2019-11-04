/*
 * Copyright (c) 2019, Tano Systems. All Rights Reserved.
 * Anton Kikin <a.kikin@tano-systems.com>
 */

'use strict';
'require rpc';
'require uci';
'require netports';

/*
	local np_default_additional_info = uci:get_bool(
		"luci_netports", "global", "default_additional_info")

	local np_default_h_mode = uci:get_bool(
		"luci_netports", "global", "default_h_mode")

	local np_hv_mode_switch_button = uci:get_bool(
		"luci_netports", "global", "hv_mode_switch_button")

	local function bool(value)
		if value or value == true then
			return "true"
		else
			return "false"
		end
	end
*/
var callNetPortsGetInfo = rpc.declare({
	object: 'netports',
	method: 'getPortsInfo',
	expect: { '': {} }
});

var netports_el = E('div', {});
var netports_object = null;

return L.Class.extend({
	__init__: function() {
		var head = document.getElementsByTagName('head')[0];
		var css = E('link', { 'href': L.resource('netports/netports.css'), 'rel': 'stylesheet' });
		head.appendChild(css);

		uci.load('luci_netports').then(function() {
			var np_default_additional_info =
				parseInt(uci.get('luci_netports', 'global', 'default_additional_info')) == 1;

			var np_default_h_mode =
				parseInt(uci.get('luci_netports', 'global', 'default_h_mode')) == 1;

			var np_hv_mode_switch_button =
				parseInt(uci.get('luci_netports', 'global', 'hv_mode_switch_button')) == 1;

			console.log(np_default_additional_info);
			console.log(np_default_h_mode);
			console.log(np_hv_mode_switch_button);

			netports_object = new netports.NetPorts({
				target: netports_el,
				mode: np_default_h_mode ? 0 : 1,
				modeSwitchButton: np_hv_mode_switch_button,
				autoSwitchHtoV: true,
				autoSwitchHtoVThreshold: 6,
				hModeFirstColWidth: 20,
				hModeExpanded: np_default_additional_info,
			});
		});
	},

	title: _('Network Interfaces Ports Status'),

	load: function() {
		return Promise.all([
			L.resolveDefault(callNetPortsGetInfo(), {})
		]);
	},

	render: function(data) {
		if (netports_object)
			netports_object.updateData(data[0]);
		return E([
			netports_el
		]);
	}
});
