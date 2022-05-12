<p align="center">
  <img width="400" src="./assets/logo-wide.png" alt="Vizarr">
</p>

[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/hms-dbmi/vizarr/main?filepath=example%2Fgetting_started.ipynb)
[![launch ImJoy](https://imjoy.io/static/badge/launch-imjoy-badge.svg)](https://imjoy.io/lite?plugin=https://github.com/hms-dbmi/vizarr/blob/main/example/VizarrDemo.imjoy.html)
[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/hms-dbmi/vizarr/blob/main/example/mandelbrot.ipynb)

![Multiscale OME-Zarr in Jupyter Notebook with Vizarr](./assets/screenshot.png)

Vizarr is a minimal, purely client-side program for viewing Zarr-based images. It is built with 
[Viv](https://github.com/hms-dbmi/viv) and exposes a Python API using the 
[`imjoy-rpc`](https://github.com/imjoy-team/imjoy-rpc), allowing users to programatically view multiplex 
and multiscale images from within a Jupyter Notebook. The ImJoy plugin registers a codec for Python 
`zarr.Array` and `zarr.Group` objects, enabling Viv to securely request chunks lazily via 
[Zarr.js](https://github.com/gzuidhof/zarr.js/). This means that other valid zarr-python 
[stores](https://zarr.readthedocs.io/en/stable/api/storage.html) can be viewed remotely with Viv, 
enabling flexible workflows when working with large datasets.

### Remote image registration workflow
We created Vizarr to enhance interactive multimodal image alignment using the 
[wsireg](https://github.com/NHPatterson/wsireg) library. We describe a rapid workflow where
comparison of registration methods as well as visual verification of alignnment can be assessed 
remotely, leveraging high-performance computational resources for rapid image processing and 
Viv for interactive web-based visualization in a laptop computer. The Jupyter Notebook containing 
the workflow described in the manuscript can be found in [`multimodal_registration_vizarr.ipynb`](multimodal_registration_vizarr.ipynb). For more information, please read our preprint [doi:10.31219/osf.io/wd2gu](https://doi.org/10.31219/osf.io/wd2gu).

> Note: The data required to run this notebook is too large to include in this repository and can be made avaiable upon request.

### Data types
Vizarr supports viewing 2D slices of n-Dimensional Zarr arrays, allowing users to choose 
a single channel or blended composites of multiple channels during analysis. It has special support 
for the developing [OME-Zarr format](https://github.com/ome/omero-ms-zarr/blob/master/spec.md)
for multiscale and multimodal images. Currently [Viv](https://github.com/hms-dbmi/viv) supports 
`i1`, `i2`, `i4`, `u1`, `u2`, `u4`, and `f4` arrays, but contributions are welcome to support more `np.dtypes`!

### Getting started 
The easiest way to get started with `vizarr` is to clone this repository and open one of 
the example [Jupyter Notebooks](example/).

### Limitations
`vizarr` was built to support the registration use case above where multiple, pyramidal OME-Zarr images
are viewed within a Jupyter Notebook. Support for other Zarr arrays is supported but not as well tested. 
More information regarding the viewing of generic Zarr arrays can be found in the example notebooks.

### Citation
If you are using Vizarr in your research, please cite our paper:

> Trevor Manz, Ilan Gold, Nathan Heath Patterson, Chuck McCallum, Mark S Keller, Bruce W Herr II, Katy Börner, Jeffrey M Spraggins, Nils Gehlenborg,
> "[Viv: multiscale visualization of high-resolution multiplexed bioimaging data on the web](https://www.nature.com/articles/s41592-022-01482-7)."
> **Nature Methods** (2022), [doi:10.31219/10.1038/s41592-022-01482-7](https://doi.org/10.1038/s41592-022-01482-7)

