frappe.pages['point-of-sales'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Point of Sales',
		single_column: true
	});

	page.set_indicator('Online', 'green')

	wrapper.point_of_sale = new erpnext.PointOfSales(wrapper);
}

erpnext.PointOfSales = class PointOfSales {
	constructor(wrapper) {
		// 0 setTimeout hack - this gives time for canvas to get width and height
		this.wrapper = $(wrapper).find('.layout-main-section');
		this.page = wrapper.page;

		const assets = [
			'assets/erpnext/js/pos/clusterize.js',
			'assets/erpnext/css/point_of_sales.css'
		];

		frappe.require(assets, () => {
			this.make();
		});
	}

	make() {
		return frappe.run_serially([
			() => {
				this.prepare_dom();
				this.prepare_menu();
				this.item_list();
				this.detail();
				this.make_buttons();
				this.make_fields();
				this.make_fields_detail_sale();
				this.add_item()
				// this.make_table_items();
			},
			() => this.page.set_title(__('Point of Sales'))
		]);
	}

	prepare_dom() {
		this.wrapper.append(`
			<div class="pos">
				<section class="cart-container">
					
				</section>
				<section class="item-container">

				</section>
			</div>
		`);
	}

	prepare_menu() {
		this.page.add_action_icon(__("fa fa-trash text-secondary fa-2x btn"), function () {
			frappe.call({
				method: "leaf_develop.point_of_sales.page.point_of_sales.point_of_sales.item",
				args: {},
				callback: function (r) {
					if (!r.exc){
						this.add_item()
					}			
				}
			})
		});
		this.page.add_action_icon(__("fa fa-print text-secondary fa-2x btn"), function () {
			frappe.msgprint("Message");
		});
		this.page.add_action_icon(__("fa fa-calculator text-secondary fa-2x btn"), function () {
			frappe.msgprint("Message");
		});
		this.page.add_action_icon(__("fa fa-exchange text-secondary fa-2x btn"), function () {
			frappe.route_options = {"sucursal": "Principal", "pos": "Caja01"}
			frappe.new_doc("Withdrawal and Entry")
		});
		this.page.add_action_icon(__("fa fa-cut text-secondary fa-2x btn"), function () {
			frappe.route_options = {"sucursal": "Principal", "pos": "Caja01"}
			frappe.new_doc("Point of sale Cut")
		});
		this.page.add_action_icon(__("fa fa-lock text-secondary fa-2x btn"), function () {
			frappe.route_options = {"sucursal": "Principal", "pos": "Caja01"}
			frappe.new_doc("Close Pos")
		});
		this.page.add_action_icon(__("fa fa-history text-secondary fa-2x btn"), function () {
			frappe.msgprint("Message");
		});
	}

	add_item(){
		this.wrapper.find('.tbody-items').append(`
			<tr>
			<th scope="row">Panadol antigripal</th>
			<td><input type="number" value="50"></td>
			<td><input type="currency" value="15"></td>
			<td>5.00</td>
			<td>235.00</td>
			</tr>
		`)
	}

	item_list(){
		this.wrapper.find('.cart-container').append(`
			<div class="pos-cart">
				<div class="fields">
					<div class="item-group-field">
					</div>
					<div class="search-field">
					</div>
					<div class="items-wrapper">
					</div>
				</div>
				<div class="cart-wrapper">
					
				</div>
				<div class="cart-items">
				<table class="table">
				<thead>
				  <tr>
					<th scope="list-item__content list-item__content--flex-1.5 text-muted">${__('Item Name')}</th>
					<th scope="list-item__content text-muted text-right">${__('Quantity')}</th>
					<th scope="list-item__content text-muted text-right">${__('Discount')}</th>
					<th scope="list-item__content text-muted text-right">${__('Rate')}</th>
					<th scope="list-item__content text-muted text-right">${__('Total')}</th>
				  </tr>
				</thead>
				<tbody class = "tbody-items">
				</tbody>
			  </table>
				</div>
		</div>
		`)
	}

	detail(){
		this.wrapper.find('.item-container').append(`
		<div class="pos-cart">
			<div class="cart-wrapper">
				<div class="list-item-table list-item list-item--head">
					<h5 class="text-muted">Detail of sale</h5>
				</div>
			</div>
			<div class="detail-items">
				<div class="detail">
				</div>
			<div>
		</div>
		</div>
		<div class="buttons flex">
		</div>
		`)
	}


	make_fields() {
		// Search field
		const me = this;
		this.search_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Link',
				label: __('Search Item'),
				options: 'Item',
				placeholder: __('Search item by name, code and barcode')
			},
			parent: this.wrapper.find('.search-field'),
			render_input: true,
		});

		this.item_group_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Link',
				label: 'Item Group',
				options: 'Item Group',
				default: me.parent_item_group,
			},
			parent: this.wrapper.find('.item-group-field'),
			render_input: true
		});
	}

	make_buttons() {
		this.wrapper.find('.buttons').append(`<div class="pause-btn" data-button-value="pause">Pause</div>`);
		this.wrapper.find('.buttons').append(`<div class="checkout-btn" data-button-value="checkout">Checkout</div>`);
	}

	make_table_items(){
		this.table_items = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Table',
				label: __(''),
				fieldname: 'pos_table_item',
				options: 'Pos Table Item',
			},
			parent: this.wrapper.find('.cart-items'),
			render_input: true,
		});
	}

	make_fields_detail_sale(){
		const me = this;
		this.customer_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Link',
				label: __('Customer'),
				fieldname: 'customer',
				options: 'Customer',
			},
			parent: this.wrapper.find('.detail'),
			render_input: true,
		});

		this.numeration_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Data',
				label: __('Numeration'),
				fieldname: 'numeration',
				read_only: 1
			},
			parent: this.wrapper.find('.detail'),
			render_input: true,
		});

		this.exonerated_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Check',
				label: __('Exonerated Sale'),
				fieldname: 'exonerated'
			},
			parent: this.wrapper.find('.detail'),
			render_input: true,
		});

		this.reason_for_discount_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Link',
				label: __('Discount reason'),
				fieldname: 'discount_reason',
				options: 'Reason For Discount'
			},
			parent: this.wrapper.find('.detail'),
			render_input: true,
		});

		this.amount_for_discount_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Currency',
				label: __('Amount for discount'),
				fieldname: 'amount'
			},
			parent: this.wrapper.find('.detail'),
			render_input: true,
		});

		this.return_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Currency',
				label: __('Return'),
				fieldname: 'return'
			},
			parent: this.wrapper.find('.detail'),
			render_input: true,
		});
	}

}