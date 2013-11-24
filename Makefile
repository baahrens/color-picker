
build: components index.js color-picker.css template.js
	@component build --dev

template.js: template.html
	@component convert $<

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

lint:
	@jshint --verbose *.json *.js

.PHONY: clean
