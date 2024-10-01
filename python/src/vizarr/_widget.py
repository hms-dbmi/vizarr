from __future__ import annotations

import concurrent.futures
import os
import pathlib
from typing import TYPE_CHECKING, TypeGuard

import anywidget
import traitlets

if TYPE_CHECKING:
    import numpy as np
    import zarr
    import zarr.storage

__all__ = ["Viewer"]

THREAD_EXECUTOR = concurrent.futures.ThreadPoolExecutor(max_workers=os.cpu_count())


def is_zarr_node(obj: object) -> TypeGuard[zarr.Array | zarr.Group]:
    return hasattr(obj, "store") and hasattr(obj, "_key_prefix")


def is_readable_store(obj: object) -> TypeGuard[zarr.storage.BaseStore]:
    return hasattr(obj, "__getitem__") and hasattr(obj, "__contains__")


def has_array_protocol(obj: object) -> bool:
    return hasattr(obj, "__array__") or hasattr(obj, "__array_interface__")


def handle_custom_message(widget: Viewer, msg: dict, _buffers: list[bytes]):
    store, key_prefix = widget._store_paths[msg["payload"]["source_id"]]
    key = key_prefix + msg["payload"]["key"].lstrip("/")

    if msg["payload"]["type"] == "has":
        widget.send({"id": msg["id"], "payload": key in store})
        return

    if msg["payload"]["type"] == "get":

        def target():
            try:
                buffers = [store[key]]
            except KeyError:
                buffers = []
            widget.send(
                {"id": msg["id"], "payload": {"success": len(buffers) == 1}},
                buffers,
            )

        THREAD_EXECUTOR.submit(target)
        return

    raise ValueError(f"Unknown message type: {msg['payload']['type']}")


def get_store_keyprefix(obj: zarr.Array | zarr.Group | np.ndarray | dict):
    if is_zarr_node(obj):
        # Just grab the store and key_prefix from zarr.Array and zarr.Group objects
        return obj.store, obj._key_prefix

    if has_array_protocol(obj):
        # Create an in-memory store, and write array as as single chunk
        import numpy as np
        import zarr
        import zarr.storage

        store = zarr.storage.MemoryStore()
        data = np.asarray(obj)
        arr = zarr.create(
            store=store, shape=data.shape, chunks=data.shape, dtype=data.dtype
        )
        arr[:] = obj
        return store, ""

    if is_readable_store(obj):
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
        self.on_msg(handle_custom_message)

    def add_image(self, source, **config):
        if not isinstance(source, str):
            store, key_prefix = get_store_keyprefix(source)
            source = {"id": len(self._store_paths)}
            self._store_paths.append((store, key_prefix))
        config["source"] = source
        self._configs = [*self._configs, config]
