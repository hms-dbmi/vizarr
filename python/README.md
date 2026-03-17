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


### development

```sh
ANYWIDGET_HMR=1 uv run --group examples jupyter lab notebooks/
```

```sh
uv run ruff check # lint
uv run ty check   # typecheck
```
