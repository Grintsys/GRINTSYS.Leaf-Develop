# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# License: GNU General Public License v3. See license.txt

from __future__ import unicode_literals
import frappe, json
from frappe.utils.nestedset import get_root_of
from frappe.utils import cint
from frappe import _
from erpnext.accounts.doctype.pos_profile.pos_profile import get_item_groups
import json
from six import string_types

@frappe.whitelist()
def item(item):
	data = ""
	isv =0	
	items = frappe.get_all("Item", ["*"], filters = {"name": item})
	item_selected = next(iter(items))
	if item_selected is None:
		frappe.throw("No item is found")
	item_prices = frappe.get_all("Item Price", ["price_list_rate"], filters = {"item_code": item_selected.item_code})
	if len(item_prices) is 0:
		frappe.throw("Item has no price")
	
	taxes = frappe.get_all("Item Tax",["*"],filters = {"parent":item_selected.name})
	if(len(taxes)>0):
		tax = next(iter(taxes))
		if tax is not None:
			taxesTemplates = frappe.get_all("Item Tax Template",["*"],filters = {"name":tax.item_tax_template})
			if len(taxesTemplates)>0:
				taxTemplate = next(iter(taxesTemplates))
				if taxTemplate is not None:
					taxesDetail = frappe.get_all("Item Tax Template Detail",["*"],filters = {"parent":taxTemplate.name})
					taxDetail = next(iter(taxesDetail))
					if taxDetail is not None:
						isv = taxDetail.tax_rate

	price = next(iter(item_prices))
	if price is None:
		frappe.throw("Item has no price")
	json = {
		'item_code': item_selected.item_code,
		'item_name': item_selected.item_name,
		'price_cu': str(price.price_list_rate),
		'total': str(price.price_list_rate),
		'isv':isv
	}

	
	return json

@frappe.whitelist()
def get_item_max_discount(item_code):
	item = frappe.get_all("Item",["max_discount"],filters = {"item_code": item_code})

	return item[0].max_discount 


@frappe.whitelist()
def get_customer_rtn(customer_name):
	customers = frappe.get_all("Customer",["rtn","customer_default"],filters = {"customer_name": customer_name})
	json = {}
	for customer in customers:
		json = {
			'customer_default': customer.customer_default,
			'rtn': customer.rtn,
		}
	
	return json

@frappe.whitelist()
def get_pos_config():
	user = frappe.session.user
	pos = frappe.get_value('GCAI Allocation',{"user":user},["pos","branch"],as_dict =1)
	if pos is None:
		frappe.throw("no GCAI Allocation")

	configs = frappe.get_all("Point Of Sale Profile",["*"],filters = {"cashier_name": pos.pos})
	config = next(iter(configs),None)
	if config is None:
		frappe.throw("no Point Of Sale Profile")
	
	config.credential = frappe.utils.password.get_decrypted_password('Point Of Sale Profile',config.name,'credential')
	
	payments_Methods = frappe.get_all("Sales Invoice Payment",["mode_of_payment"],filters = {"parent":config.name})
	config.paymentMethods = []
	for payment_Method in payments_Methods:
		config.paymentMethods.append(payment_Method.mode_of_payment)

	item_groups = frappe.get_all("POS Item Group",["item_group"],filters = {"parent":config.name})
	config.itemGroups = []
	for item_group in item_groups:
		config.itemGroups.append(item_group.item_group)


	customer_groups = frappe.get_all("POS Customer Group",["customer_group"],filters = {"parent":config.name})

	config.customerGroup = []
	for customer_group in customer_groups:
		config.customerGroup.append(customer_group.customer_group)


	config.requiresOpening = True

	openings = frappe.get_all("Opening POS",["*"],filters = {"cashier": pos.pos,"branch":pos.branch},order_by = "creation desc") 
	lastOpening = next(iter(openings),None)
	if lastOpening is None:
		return config

	clousures = frappe.get_all("Close Pos",["*"],filters = {"pos": pos.pos,"sucursal":pos.branch},order_by = "creation desc") 
	lastClousure = next(iter(clousures),None)
	if lastClousure is None:
		config.requiresOpening = False
		return config

	if lastOpening.creation > lastClousure.creation:
		config.requiresOpening = False

	return config




def initial_number(number):

	if number >= 1 and number < 10:
		return("0000000" + str(number))
	elif number >= 10 and number < 100:
		return("000000" + str(number))
	elif number >= 100 and number < 1000:
		return("00000" + str(number))
	elif number >= 1000 and number < 10000:
		return("0000" + str(number))
	elif number >= 10000 and number < 100000:
		return("000" + str(number))
	elif number >= 100000 and number < 1000000:
		return("00" + str(number))
	elif number >= 1000000 and number < 10000000:
		return("0" + str(number))
	elif number >= 10000000:
		return(str(number))

@frappe.whitelist()
def get_margin_types():
	reasons = []
	discountReasons = frappe.get_all("Reason For Discount", ["reason"]) 
	for discountReason in discountReasons:
		reasons.append(discountReason.reason)
	return reasons

@frappe.whitelist()
def get_invoice_numeration():
	user = frappe.session.user
	gcai_allocation = frappe.get_value('GCAI Allocation',{"user":user},["pos","branch","company"],as_dict =1)
	if gcai_allocation is None:
		frappe.throw(_("The user {} does not have an assigned GCAI Allocation".format(user)))

	cais = frappe.get_all("GCAI", ["*"], 
					filters = {"company": gcai_allocation.company, "sucursal": gcai_allocation.branch, "pos_name": gcai_allocation.pos, })

	cai = next(iter(cais),None)
	if cai is None:
		frappe.throw(_("The user {} does not have an assigned GCAI".format(user)))
	
	number = initial_number(cai.current_numbering)
	numeration = "{}-{}-{}-{}".format(cai.codebranch, cai.codepos, cai.codedocument, number)

	return numeration


@frappe.whitelist()
def proceed_checkout(invoice_data):
	invoice_data = json.loads(invoice_data)
	sale_invoce = frappe.new_doc("Sales Invoice")

	sale_invoce.customer = invoice_data["customer"]
	


	return sale_invoce
