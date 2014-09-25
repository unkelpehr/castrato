// castrato()
function benchmark_castrato_init (castrato) {
	Benchmark.Suite('foo')
		.add('castrato()', function () {
			castrato();
		})
		//.add('castrato2()', function() {})
		.on('cycle', function (event, bench) {
			console.log(String(event.target));
		})
		.on('complete', function() {
			console.log('Fastest is ' + this.filter('fastest').pluck('name'));
		})
		.run(true);
}



var node1 = castrato(),
	node2 = castrato(),
	noop = function () {},
	i = 0, times = 1000000;


node1.destroy().on('something', noop);

console.time('emit2');
for (i = 0; i < times; i++) {
	node2.emit('something');
}
console.timeEnd('emit2');

node1.destroy().on('something', noop);

console.time('emit');
for (i = 0; i < times; i++) {
	node2.emit('something');
}
console.timeEnd('emit');


/*
// on()
function benchmark_castrato_on (castrato) {
	var node = castrato().destroy(),
		noop = function () {};

	Benchmark.Suite('foo')
		.add('on()', function () {
			node.on('something', noop);
		})
		.add('on2()', function () {
			node.on('something', noop);
		})
		.on('cycle', function (event, bench) {
			console.log(String(event.target));
			node.destroy();
		})
		.on('complete', function() {
			console.log('Fastest is ' + this.filter('fastest').pluck('name'));
		})
		.run(true);
}

// emit()
function benchmark_castrato_emit (castrato) {
	var node1 = castrato(),
		node2 = castrato(),
		noop = function () {};

	Benchmark.Suite('foo')
		.add('emit2()', function () {
			node2.emit2('something', noop);
		})
		.add('emit()', function () {
			node2.emit('something', noop);
		})
		.on('cycle', function (event, bench) {
			console.log(String(event.target));

			node1.destroy().on('something', noop);
		})
		.on('complete', function() {
			console.log('Fastest is ' + this.filter('fastest').pluck('name'));
		})
		.run(true);
}

//benchmark_castrato_init(castrato);
benchmark_castrato_emit(castrato);
//benchmark_castrato_on(castrato);
//benchmark_castrato_off(castrato);
//benchmark_castrato_once(castrato);

*/