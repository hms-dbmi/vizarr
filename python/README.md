# vizarr

```sh
pip install vizarr
```

```python
import vizarr
import zarr

viewer = vizarr.Viewer()
viewer.add_image(source=zarr.open("path/to/ome.zarr"))
viewer
```
