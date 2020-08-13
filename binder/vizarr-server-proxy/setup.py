import setuptools

setuptools.setup(
    name="jupyter-vizarr-server",
    py_modules=['vizarr_server_proxy'],
    entry_points={
        'jupyter_serverproxy_servers': [
            'vizarr = vizarr_server_proxy:setup_vizarr',
        ]
    },
    install_requires=['jupyter-server-proxy'],
)
