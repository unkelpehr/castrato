(function () {
	function start_test (castrato, AMD) {
		let sentinel = { sentinel: 1 },
			sentinel2 = { sentinel: 2 };

		// If required as an AMD module - castrato will immediatly return a new node.
		// Therefore we'll have to wrap the incoming castrato in a dummy function that returns a "new" node. 
		// Not all tests are compatible with as being ran with only one node but the majority is.
		if (AMD) {
			let _castrato = castrato;
			castrato = function () {
				return _castrato;
			};
		}

		/*------------------------------------*\
		    A small and crude assert function
		    that can handle asynchronous tests,
		    timeouts and max/min executions.
		\*------------------------------------*/
		let assert = (function () {
			let queue = [],
				assert_in_progress = false;

			function assert (descr, times, func) {
				assert_in_progress = true;

				let timeoutId,
					mediator = castrato();

				if (!func) {
					func = times;
					times = 1;
				}

				function isOk (ok) {
					if (times === 0 && --times) {
						ok = "toomany";
					} else if (!--times) {
						clearTimeout(timeoutId);
						mediator.destroy();
						assert_in_progress = false;
					}

					if (ok === true) {
						if (!times) {
							console.info("[OK]", descr, "\n");
						}
					} else {
						clearTimeout(timeoutId);
						mediator.destroy();

						if (ok === undefined) {
							console.warn("[TIMED OUT]", descr, "\n");
						} else if (ok === "toomany") {
							console.warn("[TOO MANY]", descr, "\n");
						} else {
							console.warn("[FAILED]", descr, "\n");
						}
					}

					if (times <= 0 && queue.length) {
						let next = queue.shift();
						assert(next[0], next[1], next[2]);
					}
				}

				timeoutId = setTimeout(isOk, 200);
				try { func(isOk); } catch (e) { isOk(false); throw e; }
			}

			return function (descr, times, func) {
				if (!assert_in_progress) {
					assert(descr, times, func);
				} else {
					queue.push([descr, times, func]);
				}
			};
		}());

		/*------------------------------------*\
		    Test cases
		\*------------------------------------*/
		assert("One emit, one node.", function (isOk) {
			let node = castrato();

			node
				.on("something", function () {
					isOk(true);
				})
				.emit("something");
		});

		assert("One emit, one node. With data.", function (isOk) {
			let node = castrato();

			node
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.emit("something", sentinel);
		});

		assert("Multiple emits, one node.", 3, function (isOk) {
			let node = castrato();

			node
				.on("something", function () {
					isOk(true);
				})
				.emit("something")
				.emit("something")
				.emit("something");
		});

		assert("Multiple emits, one node. With data.", 3, function (isOk) {
			let node = castrato();

			node
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.emit("something", sentinel)
				.emit("something", sentinel)
				.emit("something", sentinel);
		});

		assert("Multiple subscriptions, one node, one emit.", 3, function (isOk) {
			let node = castrato();

			node
				.on("something", function () {
					isOk(true);
				})
				.on("something", function () {
					isOk(true);
				})
				.on("something", function () {
					isOk(true);
				})
				.emit("something");
		});

		assert("Multiple subscriptions, one node, one emit. With data.", 3, function (isOk) {
			let node = castrato();

			node
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.emit("something", sentinel);
		});

		assert("Multiple subscriptions, one node, multiple emits.", 6, function (isOk) {
			let node = castrato();

			node
				.on("something", function () {
					isOk(true);
				})
				.on("something", function () {
					isOk(true);
				})
				.on("something", function () {
					isOk(true);
				})
				.emit("something")
				.emit("something")
				.emit("something");
		});

		assert("Multiple subscriptions, one node, multiple emits. With data.", 6, function (isOk) {
			let node = castrato();

			node
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.emit("something", sentinel)
				.emit("something", sentinel)
				.emit("something", sentinel);
		});

		assert("Multiple nodes, one emit.", 3, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1.on("something", function () {
				isOk(true);
			});

			node2.on("something", function () {
				isOk(true);
			});

			node3.on("something", function () {
				isOk(true);
			});

			node4.emit("something");
		});

		assert("Multiple nodes, one emit. With data.", 3, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1.on("something", function (data) {
				isOk(data === sentinel);
			});

			node2.on("something", function (data) {
				isOk(data === sentinel);
			});

			node3.on("something", function (data) {
				isOk(data === sentinel);
			});

			node4.emit("something", sentinel);
		});

		assert("Multiple nodes, multiple emits.", 6, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1.on("something", function () {
				isOk(true);
			});

			node2.on("something", function () {
				isOk(true);
			});

			node3.on("something", function () {
				isOk(true);
			});

			node4
				.emit("something")
				.emit("something")
				.emit("something");
		});

		assert("Multiple nodes, multiple emits. With data.", 6, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1.on("something", function (data) {
				isOk(data === sentinel);
			});

			node2.on("something", function (data) {
				isOk(data === sentinel);
			});

			node3.on("something", function (data) {
				isOk(data === sentinel);
			});

			node4
				.emit("something", sentinel)
				.emit("something", sentinel)
				.emit("something", sentinel);
		});


		assert("Multiple nodes with multiple subscriptions, multiple emits.", 6, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1.on("something", function () {
				isOk(true);
			});

			node2.on("something", function () {
				isOk(true);
			});

			node3.on("something", function () {
				isOk(true);
			});

			node4
				.emit("something")
				.emit("something")
				.emit("something");
		});

		!AMD && assert("Multiple nodes with multiple subscriptions, multiple emits. With data.", 27, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				});

			node2
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				});

			node3
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				});

			node4
				.emit("something", sentinel)
				.emit("something", sentinel)
				.emit("something", sentinel);
		});

		!AMD && assert("Multiple nodes with multiple subscriptions, multiple emits. One node removes it's subscription. With data.", 18, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				});

			node2
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				});

			node3
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				});

			node2.off("something");

			node4
				.emit("something", sentinel)
				.emit("something", sentinel)
				.emit("something", sentinel);
		});

		!AMD && assert("Multiple nodes with multiple subscriptions, multiple emits. One node removes it's subscription and then binds them again. With data.", 27, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				});

			node2
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				});

			node3
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				});

			node2
				.off("something")
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				})
				.on("something", function (data) {
					isOk(data === sentinel);
				});

			node4
				.emit("something", sentinel)
				.emit("something", sentinel)
				.emit("something", sentinel);
		});

		assert("Multiple nodes with multiple subscriptions, multiple emits. One of each of the nodes removes 1 EXPLICIT handler. With data.", 18, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato(),

				h1 = function (data) { isOk(data === sentinel); },
				h2 = function (data) { isOk(data === sentinel); },
				h3 = function (data) { isOk(data === sentinel); },
				h4 = function (data) { isOk(data === sentinel); },
				h5 = function (data) { isOk(data === sentinel); },
				h6 = function (data) { isOk(data === sentinel); },
				h7 = function (data) { isOk(data === sentinel); },
				h8 = function (data) { isOk(data === sentinel); },
				h9 = function (data) { isOk(data === sentinel); };

			node1
				.on("something", h1)
				.on("something", h2)
				.on("something", h3);

			node2
				.on("something", h4)
				.on("something", h5)
				.on("something", h6);

			node3
				.on("something", h7)
				.on("something", h8)
				.on("something", h9);

			node1.off("something", h1);
			node2.off("something", h5);
			node3.off("something", h9);

			node4
				.emit("something", sentinel)
				.emit("something", sentinel)
				.emit("something", sentinel);
		});

		assert("Multiple nodes with multiple ASYNCHRONOUS subscriptions, multiple emits. With data.", 27, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1
				.on("something", function (data, done) {
					setTimeout(function() {
						done();
						isOk(data === sentinel);
					}, 150);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done();
						isOk(data === sentinel);
					}, 20);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done();
						isOk(data === sentinel);
					}, 45);
				});

			node2
				.on("something", function (data, done) {
					setTimeout(function() {
						done();
						isOk(data === sentinel);
					}, 110);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done();
						isOk(data === sentinel);
					}, 98);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done();
						isOk(data === sentinel);
					}, 43);
				});

			node3
				.on("something", function (data, done) {
					setTimeout(function() {
						done();
						isOk(data === sentinel);
					}, 54);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done();
						isOk(data === sentinel);
					}, 100);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done();
						isOk(data === sentinel);
					}, 0);
				});

			node4
				.emit("something", sentinel)
				.emit("something", sentinel)
				.emit("something", sentinel);
		});

		assert("Multiple nodes with multiple ASYNCHRONOUS subscriptions, multiple emits. That take and returns data.", 27, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 50);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 40);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 100);
				});

			node2
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 101);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 107);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 21);
				});

			node3
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 78);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 64);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 0);
				});

			node4
				.emit("something", sentinel, function (data, subscribers) {
					for (let i = 0; i < subscribers; i++) {
						isOk(data[i] === sentinel2);
					}
				})
				.emit("something", sentinel, function (data, subscribers) {
					for (let i = 0; i < subscribers; i++) {
						isOk(data[i] === sentinel2);
					}
				})
				.emit("something", sentinel, function (data, subscribers) {
					for (let i = 0; i < subscribers; i++) {
						isOk(data[i] === sentinel2);
					}
				});
		});

		assert("Multiple nodes with multiple ASYNCHRONOUS subscriptions, multiple emits. That take and returns data. With the `persistent` flag included and set to `false`", 27, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 50);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 40);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 100);
				});

			node2
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 101);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 107);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 21);
				});

			node3
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 78);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 64);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 0);
				});

			node4
				.emit(false, "something", sentinel, function (data, subscribers) {
					for (let i = 0; i < subscribers; i++) {
						isOk(data[i] === sentinel2);
					}
				})
				.emit(false, "something", sentinel, function (data, subscribers) {
					for (let i = 0; i < subscribers; i++) {
						isOk(data[i] === sentinel2);
					}
				})
				.emit(false, "something", sentinel, function (data, subscribers) {
					for (let i = 0; i < subscribers; i++) {
						isOk(data[i] === sentinel2);
					}
				});
		});

		assert("Multiple nodes with multiple ASYNCHRONOUS subscriptions, multiple emits. That take and returns data. The emits are done before any subscriptions and the persistent flag is set to `true`.", 27, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node4
				.emit(true, "something", sentinel, function (data, subscribers) {
					for (let i = 0; i < subscribers; i++) {
						isOk(data[i] === sentinel2);
					}
				})
				.emit(true, "something", sentinel, function (data, subscribers) {
					for (let i = 0; i < subscribers; i++) {
						isOk(data[i] === sentinel2);
					}
				})
				.emit(true, "something", sentinel, function (data, subscribers) {
					for (let i = 0; i < subscribers; i++) {
						isOk(data[i] === sentinel2);
					}
				});

			node1
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 50);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 40);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 100);
				});

			node2
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 101);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 107);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 21);
				});

			node3
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 78);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 64);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 0);
				});
		});

		assert("Multiple nodes with multiple ASYNCHRONOUS subscriptions, multiple emits. That take and returns data. The emits are done before any subscriptions and the persistent flag is set to `true`.\nOne of each node makes three subscriptions, one of which is \"on\" and the other two \"once\"`s.", 156, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			for (let i = 0, to = 50; i < to; i++) {
				node4
					.emit(true, "something", sentinel, function (data, subscribers) {
						for (let i = 0; i < subscribers; i++) {
							isOk(data[i] === sentinel2);
						}
					});
			}

			node1
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 40);
				})
				.once("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 50);
				})
				.once("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 40);
				});

			node2
				.once("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 101);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 40);
				})
				.once("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 107);
				});

			node3
				.once("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 78);
				})
				.once("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 64);
				})
				.on("something", function (data, done) {
					setTimeout(function() {
						done(sentinel2);
					}, 40);
				});
		});

		assert("Multiple nodes with subscriptions, multiple emits. One wildcard subscription.", 5, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				node3 = castrato(),
				node4 = castrato();

			node1
				.on("*", function () {
					isOk(true);
				})
				.emit("1", { a: "b"});

			node2.emit("2", { c: "d"});
			node3
				.emit("3", { e: "f"})
				.emit("4", { g: "h"});
			node4.emit("5", { i: "j"});
		});

		let types = [0, 1, -1, "", "0", "1", "-1", [], true, false, undefined, null, /[a-z]/, function(){}],
			typesLen = types.length;
		assert("Event data could be of any data type.", typesLen, function (isOk) {
			let node1 = castrato();

			node1.on("*", function (data, done, name) {
				isOk(data === types[name]);
				done();
			});

			for (let i = 0; i < typesLen; i++) {
				node1.emit(i, types[i]);
			}
		});

		assert("Testing signatures", 8, function (isOk) {
			let node1 = castrato(),
				node2 = castrato(),
				persistent = false,
				emitCallback = function (response) {
					isOk(response[0] === sentinel);
				};

			node1.on("*", function (data, done, name) {
				switch (name) {
				case 1:
					isOk(data === undefined);
					break;

				case 2:
					isOk(data === sentinel);
					break;

				case 3:
					isOk(data === sentinel2);
					break;

				case 4:
					isOk(data === sentinel);
					break;

				case 5:
					isOk(data === sentinel2);
					break;

				case 6:
					isOk(data === undefined);
					break;
				}

				done(sentinel);
			});

			node2
				.emit(1)
				.emit(2, sentinel)
				.emit(3, sentinel2,  emitCallback)
				.emit(persistent, 4, sentinel, emitCallback)
				.emit(persistent, 5, sentinel2)
				.emit(persistent, 6);
		});
	}

	if (typeof castrato !== "undefined") {
		start_test(castrato); // Browser
	} else if (typeof require === "function") {
		if (typeof module !== "undefined" && module.exports) { // Node
			if ((castrato = require("../source/castrato.js"))) {
				start_test(castrato);
			}
		} else { // AMD
			require(["../source/castrato.js"], function (castrato) {
				start_test(castrato, true);
			});
		}
	}
}());