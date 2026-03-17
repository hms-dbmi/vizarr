import numpy as np
import zarr
import zarr.storage
from inline_snapshot import snapshot

import vizarr


def viewer_state(viewer: vizarr.Viewer) -> str:
    """Serialize viewer internal state to a readable string for snapshot testing."""
    lines = [f"height: {viewer.height}", f"stores: {len(viewer._store_paths)}"]
    if viewer.view_state:
        lines.append(f"view_state: {viewer.view_state}")
    for i, cfg in enumerate(viewer._configs):
        parts = [f"  {k}={v}" for k, v in cfg.items()]
        lines.append(f"image[{i}]:")
        lines.extend(parts)
    return "\n".join(lines)


def test_includes_version():
    assert isinstance(vizarr.__version__, str)


def test_viewer_defaults():
    v = vizarr.Viewer()
    assert viewer_state(v) == snapshot("""\
height: 500px
stores: 0\
""")


def test_add_image_string_source():
    v = vizarr.Viewer()
    v.add_image("https://example.com/data.zarr")
    assert viewer_state(v) == snapshot("""\
height: 500px
stores: 0
image[0]:
  source=https://example.com/data.zarr\
""")


def test_add_image_numpy_array():
    v = vizarr.Viewer()
    v.add_image(np.zeros((10, 10), dtype=np.uint8), name="test")
    assert viewer_state(v) == snapshot("""\
height: 500px
stores: 1
image[0]:
  name=test
  source={'id': 0}\
""")


def test_add_image_zarr_array():
    store = zarr.storage.MemoryStore()
    arr = zarr.create_array(store=store, data=np.ones((5, 5)), zarr_format=2)
    v = vizarr.Viewer()
    v.add_image(arr)
    assert viewer_state(v) == snapshot("""\
height: 500px
stores: 1
image[0]:
  source={'id': 0}\
""")


def test_add_multiple_images():
    v = vizarr.Viewer()
    v.add_image("https://a.zarr")
    v.add_image("https://b.zarr")
    v.add_image(np.zeros((3, 3)))
    assert viewer_state(v) == snapshot("""\
height: 500px
stores: 1
image[0]:
  source=https://a.zarr
image[1]:
  source=https://b.zarr
image[2]:
  source={'id': 0}\
""")
