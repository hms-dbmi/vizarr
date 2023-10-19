# vizarr

```sh
pip install vizarr
```

```python
import vizarr
import numpy as np

arr = np.random.randint(0, 255, (1024, 1024), dtype=np.uint8)
viewer = vizarr.Viewer(source=arr)
viewer
```
