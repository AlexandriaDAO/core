default:
	$(shell vessel bin)/moc $(shell vessel sources) -wasi-system-api -o Tests.wasm Tests.mo && wasmtime Tests.wasm
	rm -f Tests.wasm
