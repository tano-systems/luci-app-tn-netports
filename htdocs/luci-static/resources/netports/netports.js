/*
 * Copyright (c) 2018, Tano Systems. All Rights Reserved.
 * Anton Kikin <a.kikin@tano-systems.com>
 */

function np_fmt_status(p, horizontal)
{
	var status  = ''
	var icon    = ''
	var phyup   = 0
	var adminup = 0

	phyup = parseInt(p.carrier)

	if (p.adminstate === "up")
		adminup = 1

	if (adminup)
	{
		if (phyup)
			icon = p.type + '_up.svg'
		else
			icon = p.type + '_down.svg'
	}
	else
		icon = p.type + '_disabled.svg'

	status += '<div class="netports-linkstatus-icon-container netports-linkstatus-icon-container-%s">'.format(
		((typeof horizontal !== 'undefined') && horizontal) ? "h" : "v"
	)

	// Link icon
	status += '<img class="netports-linkstatus-icon" src="'
	status += L.resource('netports/icons/' + icon)
	status += '" />'

	status += '</div>'
	
	status += '<div class="netports-linkstatus-text">'

	if (adminup)
	{
		if (phyup)
		{
			/*
			 * &#8201; is a thin space HTML entity code (&thinsp).
			 *
			 * I use this in the translatable strings because the strings
			 * "Connected", "Disconnected" and "Disabled" have incorrect
			 * translations in luci-base module and overlaps the translations
			 * from this application.
			 */

			var speed = parseInt(p.speed)

			if (speed > 0)
				status += speed + '&nbsp;' + _('Mbit/s')
			else
				status += _('Connected&#8201;')

			if (p.duplex === "full")
				status += ',<br />' + _('full-duplex')
			else if (p.duplex === "half")
				status += ',<br />' + _('half-duplex')
		}
		else
			status += '<span class="netports-linkstatus-text-disconnected">' +
				_('Disconnected&#8201;') + '</span><br />&#160;'
	}
	else
		status += '<span class="netports-linkstatus-text-disabled">' +
			_('Disabled&#8201;') + '</span><br />&#160;'

	status += '</div>'

	return status
}

function np_fmt_fwzones(p)
{
	var z = ''
	var ntm = []
	var out_ifname = false

	if (p.ntm && p.ntm.fwzone)
		ntm.push(p.ntm)

	if (p.ntm_bridge && p.ntm_bridge.fwzone)
		ntm.push(p.ntm_bridge)

	if (ntm.length == 0)
		return '&ndash;'

	out_ifname = ntm.length > 1

	ntm.forEach(function(n) {
		var ifname = ''

		z += '<div class="ifacebox netports-ifacebox">'
		z += '<div class="ifacebox-head netports-ifacebox-head" style="background-color: ' + n.fwzone_color + ';">'

		if (out_ifname)
			ifname = n.netname.toUpperCase() + ': '

		z += n.fwzone
			? '<strong>'
			  + '<a href="/cgi-bin/luci/admin/network/firewall/zones/' + n.fwzone_sid + '">'
			  + ifname + n.fwzone + '</a></strong>'
			: '<em>' + _('none') + '</em>'

		z += '</div></div>'
	})

	return z
}

function np_fmt_netif(p)
{
	var v = p.ifname
	if (p.ntm && (p.ntm.netname || p.ntm.wifiname))
	{
		if (p.ntm.netname)
		{
			v += ' (<a href="/cgi-bin/luci/admin/network/network/'
				+ p.ntm.netname + '">'
				+ p.ntm.netname.toUpperCase() + '</a>)'
		}

		if (p.ntm.wifiname)
		{
			v += "<br />"
			v += '[<a href="/cgi-bin/luci/admin/network/wireless/'
				+ p.ntm.wifiname + '">'
				+ p.ntm.wifiname + '</a>]'
		}
	}
	return v
}

function np_fmt_bridgeif(p)
{
	if (p.bridge)
	{
		var v = p.bridge.ifname

		if (p.ntm_bridge && p.ntm_bridge.netname)
			v += ' (<a href="/cgi-bin/luci/admin/network/network/'
				+ p.ntm_bridge.netname + '">'
				+ p.ntm_bridge.netname.toUpperCase() + '</a>)'

		v += ',<br />' + _('port&nbsp;%d').format(p.bridge.port)

		return v
	}
	else
		return '&ndash;'
}

function np_fmt_mac(p)
{
	return p.hwaddr ? p.hwaddr.toUpperCase() : '&nbsp;'
}

function np_fmt_rx(p)
{
	if (p.stats.rx_bytes)
	{
		return _('%.2mB<br />(%d&#160;%s)').format(
			p.stats.rx_bytes, p.stats.rx_packets, _('Pkts.'))
	}
	else
		return '&ndash;'
}

function np_fmt_tx(p)
{
	if (p.stats.tx_bytes)
	{
		return _('%.2mB<br />(%d&#160;%s)').format(
			p.stats.tx_bytes, p.stats.tx_packets, _('Pkts.'))
	}
	else
		return '&ndash;'
}

// Start polling data every 5 seconds
XHR.poll(-1, L.url('admin/network/netports_info'), null,
	function(x, data) {
		np_data_update(data)
	}
)
