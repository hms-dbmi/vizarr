from imjoy import api
import zarr


def encode_zarr_store(zobj):
    path_prefix = f"{zobj.path}/" if zobj.path else ""

    def getItem(key, options = None):
        return zobj.store[path_prefix + key]

    def setItem(key, value):
        zobj.store[path_prefix + key] = value

    def containsItem(key, options = None):
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
        viewer = await api.createWindow(
            type="vizarr", src="https://hms-dbmi.github.io/vizarr"
        )
        if self.view_state:
            await viewer.set_view_state(self.view_state)
        for img in self.images:
            await viewer.add_image(img)


def run_vizarr(images, view_state=None):
    api.export(Plugin(images, view_state))
