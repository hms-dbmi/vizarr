"""Vizarr: an anywidget for viewing Zarr-based images."""

from __future__ import annotations

import pathlib
from typing import TYPE_CHECKING, Literal, Protocol

import anywidget
import msgspec
import numpy as np
import traitlets
import zarr
import zarr.storage
from zarr.core.buffer import default_buffer_prototype
from zarr.core.sync import sync as _sync

if TYPE_CHECKING:
    from zarr.abc.store import Store

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
# Store adapters
# ---------------------------------------------------------------------------


class _DictLike(Protocol):
    """Protocol for dict-like store objects."""

    def __getitem__(self, key: str) -> bytes: ...
    def __contains__(self, key: object) -> bool: ...


class _ReadableStore:
    """Wraps a zarr v3 Store for synchronous, dict-like read access."""

    def __init__(self, store: Store) -> None:
        self._store = store

    def __contains__(self, key: str) -> bool:
        return _sync(self._store.exists(key))

    def __getitem__(self, key: str) -> bytes:
        buf = _sync(self._store.get(key, prototype=default_buffer_prototype()))
        if buf is None:
            raise KeyError(key)
        return buf.to_bytes()


def _store_keyprefix(
    obj: zarr.Array | zarr.Group | np.ndarray | _DictLike,
) -> tuple[_ReadableStore | _DictLike, str]:
    """Extract a readable store and key prefix from a zarr-compatible object."""
    if isinstance(obj, (zarr.Array, zarr.Group)):
        prefix = obj.path + "/" if obj.path else ""
        return _ReadableStore(obj.store), prefix

    if isinstance(obj, np.ndarray):
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
        self._store_paths: list[tuple[_ReadableStore | _DictLike, str]] = []
        self.on_msg(self._handle_custom_message)

    def _handle_custom_message(self, msg: object, buffers: list[object]) -> None:
        message = msgspec.convert(msg, type=Message[StoreOperation])
        store_id, path = message.payload.target
        store, key_prefix = self._store_paths[store_id]
        key = key_prefix + path.lstrip("/")

        if message.payload.method == "has":
            reply = Message(message.uuid, StoreResult(key in store))
            self.send(msgspec.to_builtins(reply))
            return

        if message.payload.method == "get":
            try:
                buffers = [store[key]]
            except KeyError:
                buffers = []
            reply = Message(message.uuid, StoreResult(len(buffers) == 1))
            self.send(msgspec.to_builtins(reply), buffers)
            return

    def add_image(
        self,
        source: str | zarr.Array | zarr.Group | np.ndarray | _DictLike,
        **config: object,
    ) -> None:
        """Add an image source to the viewer."""
        if isinstance(source, str):
            config["source"] = source
        else:
            store, key_prefix = _store_keyprefix(source)
            config["source"] = {"id": len(self._store_paths)}
            self._store_paths.append((store, key_prefix))
        self._configs = [*self._configs, config]
