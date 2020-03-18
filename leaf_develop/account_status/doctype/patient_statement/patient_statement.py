# -*- coding: utf-8 -*-
# Copyright (c) 2020, Frappe and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.model.document import Document
from datetime import datetime, timedelta, date

class Patientstatement(Document):
	def validate(self):
		self.status()

	def on_update(self):
		payment = frappe.get_all("Account Statement Payment", ["name"], filters = {"patient_statement": self.name})
		
		if len(payment) == 0:
			self.new_account_statement_payment()
			
		self.sum_acumulative_total()
		self.sum_advance_statement()

		self.outstanding_balance = self.cumulative_total - self.total_advance
	
	def sum_acumulative_total(self):
		data = frappe.get_all("Account Statement Payment", ["total"], filters = {"patient_statement": self.name})
		
		for item in data:
			self.cumulative_total = 0
			self.cumulative_total += item.total

	def sum_advance_statement(self):
		data = frappe.get_all("Advance Statement", ["amount"], filters = {"patient_statement": self.name})

		for item in data:
			self.total_advance = 0
			self.total_advance += item.amount
	
	def status(self):
		if self.docstatus == 0:
			self.state = "Open"

		if self.docstatus == 1:
			self.state = "Closed"
		
		if self.docstatus == 2:
			self.state = "Cancelled"
	
	def new_account_statement_payment(self):
		doc = frappe.new_doc('Account Statement Payment')
		doc.patient_statement = self.name
		doc.date = self.date
		doc.customer = self.client
		doc.insert()
	
	def on_trash(self):
		self.delete_account_statement_payment()
	
	def delete_account_statement_payment(self):
		payment = frappe.get_all("Account Statement Payment", ["name"], filters = {"patient_statement": self.name})

		if len(payment) > 0:
			for item in payment:
				doc = frappe.delete_doc("Account Statement Payment", item.name)
