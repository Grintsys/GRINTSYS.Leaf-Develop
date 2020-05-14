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
				this.make_register_item();
			},
			() => this.page.set_title(__('Point of Sale'))
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
			frappe.msgprint("Message");
		});
		this.page.add_action_icon(__("fa fa-cut text-secondary fa-2x btn"), function () {
			frappe.msgprint("Message");
		});
		this.page.add_action_icon(__("fa fa-lock text-secondary fa-2x btn"), function () {
			frappe.msgprint("Message");
		});
		this.page.add_action_icon(__("fa fa-history text-secondary fa-2x btn"), function () {
			frappe.msgprint("Message");
		});
	}

	item_list(){
		this.wrapper.find('.cart-container').append(`
			<div class="pos-cart">
				<div class="fields">
					<div class="item-group-field">
					</div>
					<div class="search-field">
					</div>
					<div class="btn-add">
					</div>
				</div>
				<div class="cart-wrapper">
					<div class="list-item-table">
						<div class="list-item list-item--head">
							<div class="list-item__content list-item__content--flex-1.5 text-muted">${__('Name')}</div>
							<div class="list-item__content text-muted text-right">${__('Quantity')}</div>
							<div class="list-item__content text-muted text-right">${__('Discount')}</div>
							<div class="list-item__content text-muted text-right">${__('Rate')}</div>
							<div class="list-item__content text-muted text-right">${__('Total')}</div>
							<div class="list-item__content text-muted text-right">${__('Actions')}</div>
						</div>
					</div>
				</div>
				<div class="cart-items">
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
			<div class="totals">
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

		this.wrapper.find('.btn-add').append(`<button class="btn btn-default btn-xs add" data-fieldtype="Button">Agregar</button>`);

		this.item_group_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Link',
				label: 'Item Group',
				options: 'Item Group',
			},
			parent: this.wrapper.find('.item-group-field'),
			render_input: true
		});
	}

	make_buttons() {
		this.wrapper.find('.buttons').append(`<div class="pause-btn" data-button-value="pause">Pause</div>`);
		this.wrapper.find('.buttons').append(`<div class="checkout-btn" data-button-value="checkout">Checkout</div>`);
	}

	make_fields_detail_sale(){
		const me = this;
		this.customer_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Link',
				label: __('Customer'),
				fieldname: 'customer',
				options: 'Customer',
				reqd: 1
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

		this.wrapper.find('.detail').append(`
			<div class="accordion" id="accordionExample">
				<div class="card">
		  			<div class="card-header" id="headingOne">
						<h2 class="mb-0">
			  				<button class="btn btn-link btn-block btn-collapse control-label" type="button" data-toggle="collapse" data-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
			  					<a>
									<i class="octicon octicon-chevron-down"></i>
			  							${__('Detail of discount')}
		  						</a>
			  				</button>
						</h2>
		  			</div>
		  			<div id="collapseOne" class="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
						<div class="card-body discount-detail">
						</div>
		  			</div>
				</div>
			</div>
		`);
		
		this.wrapper.find('.detail').append(`
			<div class="card">
				<div class="card-header" id="headingTwo">
		  			<h2 class="mb-0">
						<button class="btn btn-link btn-block btn-collapse control-label" type="button" data-toggle="collapse" data-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
							<a>
			  					<i class="octicon octicon-chevron-down"></i>
			  						${__('Detail of payment')}
		  					</a>
						</button>
		  			</h2>
				</div>
				<div id="collapseTwo" class="collapse" aria-labelledby="headingTwo" data-parent="#accordionExample">
		  			<div class="card-body detail-payment">
		  			</div>
				</div>
	  		</div>
	  	`);

		this.make_field_detail_discount();
		this.make_fields_total_detail();
		this.make_totals();
	}

	make_fields_total_detail(){
		this.reason_for_sale_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Link',
				label: __('Reason for sale'),
				fieldname: 'reason_for_sale',
				options: 'Reason for sale'
			},
			parent: this.wrapper.find('.detail-payment'),
			render_input: true,
		});

		this.exonerated_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Check',
				label: __('Exonerated Sale'),
				fieldname: 'exonerated'
			},
			parent: this.wrapper.find('.detail-payment'),
			render_input: true,
		});

		this.payment_amount_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Currency',
				label: __('Payment amount'),
				fieldname: 'payment_amount'
			},
			parent: this.wrapper.find('.detail-payment'),
			render_input: true,
		});

		this.payment_card_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Currency',
				label: __('Payment credit card'),
				fieldname: 'payment_card',
			},
			parent: this.wrapper.find('.detail-payment'),
			render_input: true,
		});

		this.return_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Currency',
				label: __('Return'),
				fieldname: 'return'
			},
			parent: this.wrapper.find('.detail-payment'),
			render_input: true,
		});
	}

	make_field_detail_discount(){
		this.reason_for_discount_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Link',
				label: __('Discount reason'),
				fieldname: 'discount_reason',
				options: 'Reason For Discount'
			},
			parent: this.wrapper.find('.discount-detail'),
			render_input: true,
		});

		this.percentage_for_discount_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Int',
				label: __('Percentage for discount'),
				fieldname: 'percentage'
			},
			parent: this.wrapper.find('.discount-detail'),
			render_input: true,
		});

		this.amount_for_discount_field = frappe.ui.form.make_control({
			df: {
				fieldtype: 'Currency',
				label: __('Amount for discount'),
				fieldname: 'amount'
			},
			parent: this.wrapper.find('.discount-detail'),
			render_input: true,
		});
	}

	make_totals(){
		this.wrapper.find('.totals').append(`
			<div class="border border-grey fixed-bottom">
				<div class="total-discount flex justify-between items-center h-16 pr-8 pl-8 border-b-grey">
					<div class="flex flex-col">
						<div class="text-md text-dark-grey text-bold">Discount</div>
					</div>
					<div class="flex flex-col text-right">
						<div class="text-md text-dark-grey text-bold">0.00</div>
					</div>
				</div>
				<div class="grand-total flex justify-between items-center h-16 pr-8 pl-8 border-b-grey">
					<div class="flex flex-col">
						<div class="text-md text-dark-grey text-bold">Grand Total</div>
					</div>
					<div class="flex flex-col text-right">
						<div class="text-md text-dark-grey text-bold">0.00</div>
					</div>
				</div>
			</div>
		`);
	}

	make_register_item(){
		this.wrapper.find('.cart-items').append(`
			<div class="list-item indicator green register">
				<div class="item-name list-item__content list-item__content--flex-1.5">
					Panadol Antigripal 500mg
				</div>
				<div class="quantity list-item__content text-muted text-right">
					${get_quantity_html()}
				</div>
				<div class="discount-percentage list-item__content text-muted text-right">
					${get_discount_html()}
				</div>
				<div class="rate list-item__content text-muted text-right">
					5000
				</div>
				<div class="total list-item__content text-muted text-right">
					5000
				</div>
				<div class="remove-icon list-item__content text-muted text-right">
					<i class="fa fa-trash red fa-lg btn trash-register"></i>
				</div>
			</div>
	`	);

	function get_quantity_html() {
		return `
			<div class="input-group input-group-xs input-number">
				<input class="form-control" type="number" value="0">
			</div>
		`;
	}

	function get_discount_html() {
		return `
			<div class="input-group input-group-xs input-number">
				<input class="form-control" type="number" value="0">
			</div>
		`;
	}

	}

}