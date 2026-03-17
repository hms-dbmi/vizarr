import * as vizarr from "https://hms-dbmi.github.io/vizarr/index.js";
import debounce from "https://esm.sh/just-debounce-it@3";

/**
 * @typedef StoreOperation
 * @property {"has" | "get"} method
 * @property {[number, string]} target
 */

/**
 * @typedef StoreResult
 * @property {boolean} success
 */

/**
 * @template T
 * @typedef Message
 * @property {string} uuid
 * @property {T} payload
 */

/**
 * @template T
 * @param {import("npm:@anywidget/types").AnyModel} model
 * @param {StoreOperation} payload
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
		 * @param {Message<T>} msg
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

/**
 * @param {import("npm:@anywidget/types").AnyModel} model
 * @param {string | { id: number }} source
 */
function get_source(model, source) {
	if (typeof source === "string") {
		return source;
	}
	return {
		/**
		 * @param {string} key
		 * @return {Promise<boolean>}
		 */
		async has(key) {
			const { data } = await send(model, {
				method: "has",
				target: [source.id, key],
			});
			return data.success;
		},
		/**
		 * @param {string} key
		 * @return {Promise<Uint8Array | undefined>}
		 */
		async get(key) {
			const { data, buffers } = await send(model, {
				method: "get",
				target: [source.id, key],
			});
			if (!data.success) {
				return undefined;
			}
			return new Uint8Array(buffers[0].buffer);
		},
	};
}

/**
 * @typedef Model
 * @property {string} height
 * @property {ViewState=} view_state
 * @property {{ source: string | { id: number }}[]} _configs
 */

/**
 * @typedef ViewState
 * @property {number} zoom
 * @property {[x: number, y: number]} target
 */

export default {
	/** @type {import("npm:@anywidget/types").Render<Model>} */
	async render({ model, el }) {
		let div = document.createElement("div");
		{
			div.style.height = model.get("height");
			div.style.backgroundColor = "black";
			model.on("change:height", () => {
				div.style.height = model.get("height");
			});
		}
		let viewer = await vizarr.createViewer(div);
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
		{
			// sources are append-only now
			for (const config of model.get("_configs")) {
				const source = get_source(model, config.source);
				viewer.addImage({ ...config, source });
			}
			model.on("change:_configs", () => {
				const last = model.get("_configs").at(-1);
				if (!last) return;
				const source = get_source(model, last.source);
				viewer.addImage({ ...last, source });
			});
		}
		el.appendChild(div);
	},
};
