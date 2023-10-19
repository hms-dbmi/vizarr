import * as vizarr from "https://hms-dbmi.github.io/vizarr/index.js";
import debounce from "https://esm.sh/just-debounce-it@3";

/**
 * @template T
 * @param {import("npm:@anywidget/types").AnyModel} model
 * @param {any} payload
 * @param {{ timeout?: number }} [options]
 * @returns {Promise<{ data: T, buffers: DataView[] }>}
 */
function send(model, payload, { timeout = 3000 } = {}) {
	let uuid = globalThis.crypto.randomUUID();
	return new Promise((resolve, reject) => {
		let timer = setTimeout(() => {
			reject(new Error(`Promise timed out after ${timeout} ms`));
			model.off("msg:custom", handler);
		}, timeout);
		/**
		 * @param {{ uuid: string, payload: T }} msg
		 * @param {DataView[]} buffers
		 */
		function handler(msg, buffers) {
			if (!(msg.uuid === uuid)) return;
			clearTimeout(timer);
			resolve({ data: msg.payload, buffers });
			model.off("msg:custom", handler);
		}
		model.on("msg:custom", handler);
		model.send({ payload, uuid });
	});
}

/** @param {import("npm:@anywidget/types").AnyModel} model */
function get_source(model) {
	let source = model.get("_source");
	if (typeof source === "string") {
		return source;
	}
	// create a python
	return {
		/**
		 * @param {string} key
		 * @return {Promise<ArrayBuffer>}
		 */
		async getItem(key) {
			const { data, buffers } = await send(model, {
				type: "get",
				source_id: source.id,
				key,
			});
			if (!data.success) {
				throw { __zarr__: "KeyError" };
			}
			return buffers[0].buffer;
		},
		/**
		 * @param {string} key
		 * @return {Promise<boolean>}
		 */
		async containsItem(key) {
			const { data } = await send(model, {
				type: "has",
				source_id: source.id,
				key,
			});
			return data;
		},
	};
}

/**
 * @typedef Model
 * @property {string | { id: string }} _source
 * @property {string} height
 * @property {ViewState=} view_state
 */

/**
 * @typedef ViewState
 * @property {number} zoom
 * @property {[x: number, y: number]} target
 */

/** @type {import("npm:@anywidget/types").Render<Model>} */
export function render({ model, el }) {
	let div = document.createElement("div");
	{
		div.style.height = model.get("height");
		div.style.backgroundColor = "black";
		model.on("change:height", () => {
			div.style.height = model.get("height");
		});
	}
	let viewer = vizarr.createViewer(div);
	{
		model.on("change:view_state", () => {
			viewer.setViewState(model.get("view_state"));
		});
		viewer.on(
			"viewStateChange",
			debounce((/** @type {ViewState} */ update) => {
				model.set("view_state", update);
				model.save_changes();
			}, 200),
		);
	}
	viewer.addImage({ source: get_source(model) });
	el.appendChild(div);
}
