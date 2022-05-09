# Examples

## Install Requirements

The examples require the `imjoy-jupyter-extension`. If running locally, please install the following:

```bash
$ pip install -U imjoy-jupyter-extension
$ pip install -r requirements.txt
```

## Getting Started [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/hms-dbmi/vizarr/main?filepath=example%2Fgetting_started.ipynb)

This example will work in the Jupyter Notebook (not jupyterlab).

```bash
$ jupyter notebook getting_started.ipynb
```

## Viewing an Image from the Imaging Data Resource [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/hms-dbmi/vizarr/main?filepath=example%2FIDR_example.ipynb)

OME-Zarr is a developing open standard for imaging from the OME community. The [Imaging Data Resource](https://idr.openmicroscopy.org) (IDR) has provided serveral images in this experimental format which are publically available.

```bash
$ jupyter notebook IDR_example.ipynb
```

## Display a Zoomable Mandelbrot Set [![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/hms-dbmi/vizarr/main?filepath=example%2Fmandelbrot.ipynb)

This notebook a contains a `vizarr` example visualizing a generic multiscale Zarr. The first cell contains code to create the underlying generative Zarr store. It dynamically creates "chunks" at different zoom levels and associated array metadata.

```bash
$ jupyter notebook mandelbrot.ipynb
```

## Display an Image in an ImJoy Plugin [![launch ImJoy](https://imjoy.io/static/badge/launch-imjoy-badge.svg)](https://imjoy.io/lite?plugin=https://github.com/hms-dbmi/vizarr/blob/main/example/VizarrDemo.imjoy.html)

The [demo plugin](VizarrDemo.imjoy.html) shows how to build an image visualization plugin with `vizarr` in [ImJoy](https://imjoy.io).


