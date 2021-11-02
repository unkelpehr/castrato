export default [
	{
		input: "./source/castrato.single.js",
		output: {
			file: "dist/castrato.cjs",
			format: "umd",
			name: "castrato",
			exports: "default"
		}
	},
	{	
		input: "./source/castrato.js",
		output: {
			file: "dist/castrato.mjs",
			format: "es"
		}
	}
];