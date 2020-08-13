def setup_vizarr():
    return {
        'command': [
            'python', '-m', 'http.server', '--directory', 'out/', '{port}',
        ]
    }
