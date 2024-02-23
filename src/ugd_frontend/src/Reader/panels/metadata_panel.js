import { UIPanel, UIText } from '../ui.js';

export class MetadataPanel extends UIPanel {

	constructor(reader) {

		super();
		super.setId('metadata');

		this.title = new UIText().setId('book-title');
		this.author = new UIText().setId('book-author');
		this.separator = new UIText().setId('book-title-separator');

		super.add([this.title, this.separator, this.author]);

		//-- events --//

		reader.on('metadata', (meta) => {

			this.init(meta);
		});
	}

	init(meta) {

		document.title = meta.title + " – " + meta.author;

		this.title.setValue(meta.title);
		this.author.setValue(meta.author);
		this.separator.dom.style.display = 'inline-block';
	}
}
