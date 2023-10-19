import importlib.metadata

try:
    __version__ = importlib.metadata.version("vizarr")
except importlib.metadata.PackageNotFoundError:
    __version__ = "unknown"

del importlib

from ._widget import Viewer
