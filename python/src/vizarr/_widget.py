import anywidget
import traitlets
import pathlib

import zarr
import numpy as np

__all__ = ["Viewer"]


def _store_keyprefix(obj):
    # Just grab the store and key_prefix from zarr.Array and zarr.Group objects
    if isinstance(obj, (zarr.Array, zarr.Group)):
        return obj.store, obj._key_prefix

    if isinstance(obj, np.ndarray):
        # Create an in-memory store, and write array as as single chunk
        store = {}
        arr = zarr.create(
            store=store, shape=obj.shape, chunks=obj.shape, dtype=obj.dtype
        )
        arr[:] = obj
        return store, ""

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
