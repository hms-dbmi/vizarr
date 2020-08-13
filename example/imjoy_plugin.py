from imjoy import api
from os import getenv
import zarr


def encode_zarr_store(zobj):
    path_prefix = f"{zobj.path}/" if zobj.path else ""

    def getItem(key):
        return zobj.store[path_prefix + key]

    def setItem(key, value):
        zobj.store[path_prefix + key] = value

    def containsItem(key):
        if path_prefix + key in zobj.store:
            return True

    return {
        "_rintf": True,
        "_rtype": "zarr-array" if isinstance(zobj, zarr.Array) else "zarr-group",
        "getItem": getItem,
        "setItem": setItem,
        "containsItem": containsItem,
    }


api.registerCodec(
    {"name": "zarr-array", "type": zarr.Array, "encoder": encode_zarr_store}
)
api.registerCodec(
    {"name": "zarr-group", "type": zarr.Group, "encoder": encode_zarr_store}
)


class Plugin:
    def __init__(self, images, view_state=None):
        if not isinstance(images, list):
            images = [images]
        self.images = images
        self.view_state = view_state

    async def setup(self):
        pass

    async def run(self, ctx):
        # If we're running on Binder vizarr should be built locally and served
        # by jupyter-server-proxy under PREFIX/vizarr/
        if getenv("BINDER_REPO_URL"):
            vizarr_src = f"{getenv('JUPYTERHUB_SERVICE_PREFIX')}vizarr"
        else:
            vizarr_src = "https://hms-dbmi.github.io/vizarr"
        viewer = await api.createWindow(
            type="viv-plugin", src=vizarr_src
        )
        if self.view_state:
            await viewer.set_view_state(self.view_state)
        for img in self.images:
            await viewer.add_image(img)


def run_vizarr(images, view_state=None):
    api.export(Plugin(images, view_state))
