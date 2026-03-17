"""Vizarr: an anywidget for viewing Zarr-based images."""

import asyncio
import pathlib
from typing import Literal

import anywidget
import msgspec
import numpy as np
import traitlets
import zarr
import zarr.storage
from zarr.abc.store import Store
from zarr.core.buffer import default_buffer_prototype

__all__ = ["Viewer"]

# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------


class StoreOperation(msgspec.Struct):
    """An operation to perform against a store."""

    method: Literal["has", "get"]
    target: tuple[int, str]


class StoreResult(msgspec.Struct):
    """The result of a store operation."""

    success: bool


class Message[T](msgspec.Struct):
    """A message with a correlation id."""

    uuid: str
    payload: T


# ---------------------------------------------------------------------------
# Store helpers
# ---------------------------------------------------------------------------


def _resolve_store(
    obj: zarr.Array | zarr.Group | np.ndarray | Store,
) -> tuple[Store, str]:
    """Extract a store and key prefix from a zarr-compatible object."""
    if isinstance(obj, (zarr.Array, zarr.Group)):
        prefix = obj.path + "/" if obj.path else ""
        return obj.store, prefix

    if isinstance(obj, np.ndarray):
        store = zarr.storage.MemoryStore()
        zarr.create_array(
            store=store,
            data=obj,
            chunks=obj.shape,
            zarr_format=2,
        )
        return store, ""

    if isinstance(obj, Store):
        return obj, ""

    msg = "Cannot normalize store path"
    raise TypeError(msg)


# ---------------------------------------------------------------------------
# Widget
# ---------------------------------------------------------------------------


class Viewer(anywidget.AnyWidget):
    """An anywidget for viewing Zarr-based images."""

    _esm = pathlib.Path(__file__).parent / "_widget.js"
    _configs = traitlets.List().tag(sync=True)
    view_state = traitlets.Dict().tag(sync=True)
    height = traitlets.Unicode("500px").tag(sync=True)

    def __init__(self, **kwargs: object) -> None:
        super().__init__(**kwargs)
        self._store_paths: list[tuple[Store, str]] = []
        self._pending_tasks: set[asyncio.Task[None]] = set()
        self.on_msg(self._handle_custom_message)

    def _handle_custom_message(
        self,
        _widget: object,
        msg: object,
        _buffers: list[object],
    ) -> None:
        task = asyncio.create_task(self._handle_store_request(msg))
        self._pending_tasks.add(task)
        task.add_done_callback(self._pending_tasks.discard)

    async def _handle_store_request(self, msg: object) -> None:
        message = msgspec.convert(msg, type=Message[StoreOperation])
        store_id, path = message.payload.target
        store, key_prefix = self._store_paths[store_id]
        key = key_prefix + path.lstrip("/")

        if message.payload.method == "has":
            success = await store.exists(key)
            reply = Message(message.uuid, StoreResult(success))
            self.send(msgspec.to_builtins(reply))
            return

        if message.payload.method == "get":
            buf = await store.get(key, prototype=default_buffer_prototype())
            if buf is not None:
                reply = Message(message.uuid, StoreResult(success=True))
                self.send(msgspec.to_builtins(reply), [buf.to_bytes()])
            else:
                reply = Message(message.uuid, StoreResult(success=False))
                self.send(msgspec.to_builtins(reply))
            return

    def add_image(
        self,
        source: str | zarr.Array | zarr.Group | np.ndarray | Store,
        **config: object,
    ) -> None:
        """Add an image source to the viewer."""
        if isinstance(source, str):
            config["source"] = source
        else:
            store, key_prefix = _resolve_store(source)
            config["source"] = {"id": len(self._store_paths)}
            self._store_paths.append((store, key_prefix))
        self._configs = [*self._configs, config]
