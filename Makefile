
test:
	@node spec/node.js
	
benchmark:
	@node benchmarks/run.js
	
.PHONY: test benchmark