import { UIPanel, UIRow, UISelect, UIInput, UILabel, UIInteger } from '../ui.js';

export class SettingsPanel extends UIPanel {

	constructor(reader) {

		super();
		super.setId('settings');

		const strings = reader.strings;

		const languageStr = strings.get('sidebar/settings/language');
		const languageRow = new UIRow();
		const language = new UISelect().setOptions({
			en: 'English',
			fr: 'French',
			ja: 'Japanese',
			ru: 'Russian'
		});
		language.dom.addEventListener('change', (e) => {

			reader.settings.language = e.target.value;
		});

		languageRow.add(new UILabel(languageStr));
		languageRow.add(language);

		const fontSizeStr = strings.get("sidebar/settings/fontsize");
		const fontSizeRow = new UIRow();
		const fontSize = new UIInteger(100, 1);
		fontSize.dom.onchange = (e) => {

			reader.emit("styleschanged", {
				fontSize: parseInt(e.target.value)
			});
		};

		fontSizeRow.add(new UILabel(fontSizeStr));
		fontSizeRow.add(fontSize);

		// -- spdead configure -- //

		const spreadStr = strings.get("sidebar/settings/spread");
		const spreadRow = new UIRow();
		const spread = new UISelect().setOptions({
			none: "None",
			auto: "Auto"
		});
		spread.dom.onchange = (e) => {

			reader.emit("spreadchanged", {
				mod: e.target.value,
				min: reader.settings.spread["min"]
			});
		};

		spreadRow.add(new UILabel(spreadStr));
		spreadRow.add(spread);

		const minSpreadWidthStr = strings.get("sidebar/settings/spread/pagewidth");
		const minSpreadWidthRow = new UIRow();
		const minSpreadWidth = new UIInteger(800, 1);
		minSpreadWidth.dom.onchange = (e) => {

			reader.emit("spreadchanged", {
				mod: reader.settings.spread["mod"],
				min: e.target.value
			});
		};

		minSpreadWidthRow.add(new UILabel(minSpreadWidthStr));
		minSpreadWidthRow.add(minSpreadWidth);

		// -- pagination -- //

		const paginationStr = strings.get('sidebar/settings/pagination');
		const paginationRow = new UIRow();
		const pagination = new UIInput('checkbox', false, paginationStr[1]);
		pagination.setId('pagination');
		pagination.dom.addEventListener('click', (e) => {

			reader.settings.pagination = e.target.checked;
			reader.generatePagination(); // not implemented
		});

		paginationRow.add(new UILabel(paginationStr[0], 'pagination'));
		paginationRow.add(pagination);

		super.add([
			languageRow,
			fontSizeRow,
			spreadRow,
			minSpreadWidthRow,
			//paginationRow
		]);

		//-- events --//

		reader.on('bookready', () => {

			language.setValue(reader.settings.language);
		});

		reader.on("styleschanged", (value) => {

			if (fontSize.getValue() !== value["fontSize"]) {
				fontSize.setValue(value["fontSize"]);
			}
		});

		reader.on("spreadchanged", (value) => {

			if (spread.getValue() !== value["mod"]) {
				spread.setValue(value["mod"]);
			}

			if (minSpreadWidth.getValue() !== value["min"]) {
				minSpreadWidth.setValue(value["min"]);
			}
		});
	}
}
