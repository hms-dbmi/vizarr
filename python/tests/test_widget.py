import vizarr


def test_creates_viewer():
    viewer = vizarr.Viewer()
    assert viewer is not None
