"""
GLOWTEX S.A.S. | Servidor local con Python (biblioteca estándar, sin instalar nada).

Uso:
    python python_server.py

Luego abre: http://localhost:8000
El portal interno está en: http://localhost:8000/intranet/index.html

Para cambiar el puerto:
    set PORT=9000 && python python_server.py      (Windows)
    PORT=9000 python python_server.py             (Linux / macOS)
"""

import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = int(os.environ.get("PORT", "8000"))


class GlowtexHandler(SimpleHTTPRequestHandler):
    """Sirve todos los archivos del proyecto desde la carpeta raíz."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        print("[GLOWTEX] " + (fmt % args))


if __name__ == "__main__":
    with ThreadingHTTPServer(("0.0.0.0", PORT), GlowtexHandler) as httpd:
        print("=" * 60)
        print("  GLOWTEX | Servidor Python activo")
        print("  Tienda:    http://localhost:{0}".format(PORT))
        print("  Intranet:  http://localhost:{0}/intranet/index.html".format(PORT))
        print("  Ctrl + C para detener")
        print("=" * 60)
        httpd.serve_forever()
