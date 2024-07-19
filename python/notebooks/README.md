# Examples

## Install Requirements

The examples require the `vizarr` [anywidget](https://github.com/manzt/anywidget). If running locally, please install the following:

```bash
pip install vizarr
```

## Getting Started

This example will work in the Jupyter, JupyterLab, VS Code, and more. We recommend trying our JupyterLab.

```bash
$ jupyter lab getting_started.ipynb
```

## Viewing an Image from the Imaging Data Resource

OME-NGFF is an open standard for imaging from the OME community. The [Imaging Data Resource](https://idr.openmicroscopy.org) (IDR) 
provides serveral images in this format which are publically available.

```bash
$ jupyter lab IDR_example.ipynb
```

## Display a Zoomable Mandelbrot Set

This notebook a contains a `vizarr` example visualizing a generic multiscale Zarr. The first cells create the
underlying generative Zarr store. It dynamically creates "chunks" at different zoom levels and associated array metadata.

```bash
$ jupyter lab mandelbrot.ipynb
```