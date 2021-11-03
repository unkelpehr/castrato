export default castrato;
/**
 * @type {Castrato}
 */
export let castrato: Castrato;
/**
 * Castrato entrypoint
 *
 * @constructor
 * @returns {Castrato}
 */
declare function Castrato(): Castrato;
declare class Castrato {
    nodeId: number;
    /**
     * Execute all handlers attached to the given event.
     *
     * @method emit
     * @param {String} event The event to emit
     * @param {Object} [data=undefined] Parameters to pass along to the event handler.
     * @param {Function} [func=undefined] A function to execute when all event handlers has returned.
     * @return {Castrato} `this`
     * @example
     * 	$.emit('something');
     * 	$.emit('something', { foo: 'bar' });
     * 	$.emit('something', { foo: 'bar' }, function (data, subscribers) {
     * 		console.log('Emit done, a total of ' + subscribers + ' subscribers returned: ', data);
     * 	});
     */
    emit(persistent: any, event: string, data?: any, handler: any): Castrato;
    /**
     * Attach an event handler function for an event.
     *
     * @method on
     * @param {String} event The event to subscribe to.
     * @param {Function} handler A function to execute when the event is triggered.
     * @return {Castrato} `this`
     * @example
     * 	$.on('something', function (data) {
     * 		console.log('Got something!', data);
     * 	});
     */
    on(event: string, handler: Function): Castrato;
    /**
     * Attach an event handler function for an event which will only be fired once.
     *
     * @method once
     * @param {String} event The event to subscribe to.
     * @param {Function} handler A function to execute when the event is triggered.
     * @return {Castrato} `this`
     * @example
     * 	$.once('something', function (data) {
     * 		console.log('Got something!', data);
     * 	});
     */
    once(event: string, handler: Function): Castrato;
    /**
     * Removes an event handler function for an event.
     *
     * @method off
     * @param {String} event The event to unsubscribe from.
     * @param {Function} [handler=null] The original handler that was attached to this event. If not passed, all subscriptions will be removed.
     * @return {Castrato} `this`
     * @example
     * 	$.off('something');
     * 	$.off('something else', handler);
     */
    off(event: string, handler?: Function): Castrato;
    destroy(): Castrato;
}
