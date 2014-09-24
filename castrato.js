/**
 * The MIT License (MIT)
 * 
 * Copyright (c) <2014> <Pehr Boman, github.com/unkelpehr>
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
/** @license MIT license-castrato-©2014 Pehr Boman <github.com/unkelpehr> */
(function (self, factory) {
    if (typeof define === 'function' && define.amd) {
    	// AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') { // Node
        module.exports = factory();
    } else {
    	// Attaches to the current context
        self.castrato = factory;
  	}
}(this, (function () {
	var
		/**
		 * Contains the next unique node id.
		 *
		 * @property index
		 * @type {Integer}
		 * @private
		 */
		index = 0,

		/**
		 * Contains all subscriptions
		 *
		 * @property subs
		 * @type {Object}
		 * @private
		 */
		subs = {},

		/**
		 * Contains all emits that has been done with the `persistent` parameter set to `true`.
		 *
		 * @property emits
		 * @type {Object}
		 * @private
		 */
		emits = {},

		/**
		 * An empty function that does not accept any arguments.
		 * 
		 * @property noop
		 * @type {function}
		 * @private
		 */
		noop = function () {};

	/**
	 * Creates a new entry in the `subs` object.
	 *
	 * @method on
	 * @private
	 * @param {Integer} fromId The unique subscriber ID.
	 * @param {String} event The event to subscribe to.
	 * @param {Function} handler A function to execute when the event is triggered.
	 */
	function on (fromId, event, handler) {
		var i, item, subscription = [fromId, handler, handler.length];

		// Create if needed a namespace for this event and push the subscription.
		(subs[event] || (subs[event] = [])).push(subscription);

		// If it exists a persistent event that matches that which is currently being bound;
		// loop through and each of them and emit to this handler.
		if (emits[event]) {
			i = 0;
			subscription = [subscription];
			while ((item = emits[event][i++])) {
				emit(
					0, // `persistent`
					0, // `event`
					item[0], // `data`
					item[1], // `handler`
					subscription // `explicitSubs`
				);
			}
		}
	}

	/**
	 * Removes all event handlers originating from `fromId` and optionally filter by handler.
	 *
	 * @method off
	 * @private
	 * @param {Integer} fromId The unique subscriber ID.
	 * @param {String} event The event to unsubscribe from.
	 * @param {Function} [handler=null] The original handler that was attached to this event. If not passed, all subscriptions will be removed.
	 */
	function off (fromId, event, handler) {
		var sub,
			i = 0,
			toSubs = subs[event];

		if (toSubs) {
			while ((sub = toSubs[i++])) {
				if (sub[0] === fromId && (!handler || handler === sub[1])) {
					toSubs.splice(--i, 1);
				}
			}
		}
	}

	/**
	 * Loops through all subscriptions, calling all handlers attached to given `event`.
	 *
	 * @method emit
	 * @private
	 * @param {Integer} fromId The unique subscriber ID.
	 * @param {String} event The event to emit
	 * @param {Object} [data=undefined] Parameters to pass along to the event handler.
	 * @param {Function} [handler=undefined] A function to execute when all event handlers has returned.
	 */
	function emit (persistent, event, data, handler, explicitSubs) {
		var sub,
			toSubs = explicitSubs || subs[event] || [],
			total = toSubs.length,
			left = total,
			loop = total,
			answers = [],
			done;

		if (loop) {
			done = !handler ? noop : function (data) {
				if (data) {
					answers.push(data);
				}

				if (!--left) {
					handler(answers, total);
					handler = 0;
				}
			};

			// Execute all handlers that are bound to this event.
			// Passing `done` if the handler expects it - otherwise decrementing the `left` variable.
			while ((sub = toSubs[--loop])) {
				sub[1](data, (sub[2] > 1) ? done : left--);
			}
		}

		// `func` get destructed when called.
		// It has to be called at least once - even if no one was subscribing.
		// Execute it if it still exists.
		if (!left && handler) {
			handler(answers, total);
		}

		// Save this emit if the `persistent` parameter is set to `true`.
		if (persistent) {
			(emits[event] || (emits[event] = [])).push([data, handler]);
		}
	}

	return function () {
		var nodeId = index++;

		return {
			/**
			 * Execute all handlers attached to the given event.
			 *
			 * @method emit
			 * @param {String} event The event to emit
			 * @param {Object} [data=undefined] Parameters to pass along to the event handler.
			 * @param {Function} [func=undefined] A function to execute when all event handlers has returned.
			 * @return {Object} `this`
			 * @example
			 * 	$.emit('something');
			 * 	$.emit('something', { foo: 'bar' });
			 * 	$.emit('something', { foo: 'bar' }, function (data, subscribers) {
			 * 		console.log('Emit done, a total of ' + subscribers + ' subscribers returned: ', data);
			 * 	});
			 */
			emit: function (persistent, event, data, handler) {
				// emit('something', { data: true }, function () {});
				if (persistent !== true && persistent !== false) {
					handler = data;
					data = event;
					event = persistent;
					persistent = false;
				}

				emit(persistent, event, data, handler);

				return this;
			},

			/**
			 * Attach an event handler function for one event.
			 *
			 * @method on
			 * @param {String} event The event to subscribe to.
			 * @param {Function} handler A function to execute when the event is triggered.
			 * @return {Object} `this`
			 * @example
			 * 	$.on('something', function (data) {
			 * 		console.log('Got something!', data);
			 * 	});
			 */
			on: function (event, handler) {
				on(nodeId, event, handler);
				return this;
			},

			/**
			 * Removes an event handler function for one event.
			 *
			 * @method off
			 * @param {String} event The event to unsubscribe from.
			 * @param {Function} [handler=null] The original handler that was attached to this event. If not passed, all subscriptions will be removed.
			 * @return {Object} `this`
			 * @example
			 * 	$.off('something');
			 * 	$.off('something else', handler);
			 */
			off: function (event, handler) {
				off(nodeId, event, handler);
				return this;
			},

			// Only used in testing.
			// Should get removed in production (and will be removed in the minified version)
			destroy: function () {
				index = 0;
				subs = {};
			}
		};
	};
}())));