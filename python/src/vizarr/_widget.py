import anywidget
import traitlets
import pathlib

import zarr
import zarr.storage
import numpy as np
from zarr.core.sync import sync as _sync
from zarr.core.buffer import default_buffer_prototype

__all__ = ["Viewer"]


class _ReadableStore:
    """Wraps a zarr v3 Store for synchronous, dict-like read access."""

    def __init__(self, store):
        self._store = store

    def __contains__(self, key):
        return _sync(self._store.exists(key))

    def __getitem__(self, key):
        buf = _sync(self._store.get(key, prototype=default_buffer_prototype()))
        if buf is None:
            raise KeyError(key)
        return buf.to_bytes()


def _store_keyprefix(obj):
    # Just grab the store and key_prefix from zarr.Array and zarr.Group objects
    if isinstance(obj, (zarr.Array, zarr.Group)):
        prefix = obj.path + "/" if obj.path else ""
        return _ReadableStore(obj.store), prefix

    if isinstance(obj, np.ndarray):
        # Create an in-memory store, and write array as a single chunk
        store = zarr.storage.MemoryStore()
        zarr.create_array(
            store=store,
            data=obj,
            chunks=obj.shape,
            zarr_format=2,
        )
        return _ReadableStore(store), ""

    if hasattr(obj, "__getitem__") and hasattr(obj, "__contains__"):
        return obj, ""

    raise TypeError("Cannot normalize store path")


class Viewer(anywidget.AnyWidget):
    _esm = pathlib.Path(__file__).parent / "_widget.js"
    _configs = traitlets.List().tag(sync=True)
    view_state = traitlets.Dict().tag(sync=True)
    height = traitlets.Unicode("500px").tag(sync=True)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._store_paths = []
        self.on_msg(self._handle_custom_msg)

    def _handle_custom_msg(self, msg, buffers):
        store, key_prefix = self._store_paths[msg["payload"]["source_id"]]
        key = key_prefix + msg["payload"]["key"].lstrip("/")

        if msg["payload"]["type"] == "has":
            self.send({"uuid": msg["uuid"], "payload": key in store})
            return

        if msg["payload"]["type"] == "get":
            try:
                buffers = [store[key]]
            except KeyError:
                buffers = []
            self.send(
                {"uuid": msg["uuid"], "payload": {"success": len(buffers) == 1}},
                buffers,
            )
            return

    def add_image(self, source, **config):
        if not isinstance(source, str):
            store, key_prefix = _store_keyprefix(source)
            source = {"id": len(self._store_paths)}
            self._store_paths.append((store, key_prefix))
        config["source"] = source
        self._configs = self._configs + [config]
