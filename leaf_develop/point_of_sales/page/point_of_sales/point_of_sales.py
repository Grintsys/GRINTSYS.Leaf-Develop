# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.utils.nestedset import get_root_of
from frappe.utils import cint
from erpnext.accounts.doctype.pos_profile.pos_profile import get_item_groups

from six import string_types

@frappe.whitelist()
def item(item):
	data = ""
	json = []
	items = frappe.get_all("Item", ["item_name", "item_code"], filters = {"name": item})
	for item_selected in items:
		item_prices = frappe.get_all("Item Price", ["price_list_rate"], filters = {"item_code": item_selected.item_code})
		for price in item_prices:
			json = [{
				'item_code': item_selected.item_code,
				'item_name': item_selected.item_name,
				'price_cu': str(price.price_list_rate),
				'total': str(price.price_list_rate)
			}]

	if len(items) > 0 and len(item_prices) > 0:
		data = items[0].item_name + "," + str(item_prices[0].price_list_rate) + "," + str(item_prices[0].price_list_rate)

	return data