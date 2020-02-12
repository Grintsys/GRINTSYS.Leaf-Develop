from __future__ import unicode_literals
from frappe import _

def get_data():
    return [
        {
			"label": _("Account Status"),
			"items": [
				{
					"type": "doctype",
					"name": "Patient statement",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Medical Honorarium",
					"onboard": 1,
				}
			]
		},
		{
			"label": _("Doctors"),
			"items": [
				{
					"type": "doctype",
					"name": "Medical",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Medical Category",
					"onboard": 1,
				},
				{
					"type": "doctype",
					"name": "Honorarium Payment",
					"onboard": 1,
				}
			]
		}
    ]