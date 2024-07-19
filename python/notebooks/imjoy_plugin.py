from imjoy import api
from imjoy_rpc import register_default_codecs

register_default_codecs()

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
