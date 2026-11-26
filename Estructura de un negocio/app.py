"""
GLOWTEX S.A.S. | Aplicación Python (Flask) para despliegue en la nube.

Esta app sirve la plataforma pública y el portal interno (ERP + CRM)
con un único comando. Es compatible con Render, PythonAnywhere, Railway, etc.

Uso local:
    pip install -r requirements.txt
    python app.py
    http://localhost:5000
"""

import os
from pathlib import Path

from flask import Flask, abort, send_from_directory

ROOT = Path(__file__).resolve().parent
app = Flask(__name__, static_folder=None)


@app.route("/")
def home():
    return send_from_directory(ROOT, "index.html")


@app.route("/<path:file_path>")
def serve_file(file_path):
    """Sirve CSS, JS, imágenes y las páginas de /intranet/ de forma segura."""
    target = (ROOT / file_path).resolve()

    # Evita salir de la carpeta del proyecto (path traversal)
    if target != ROOT and ROOT not in target.parents:
        abort(403)
    if not target.is_file():
        abort(404)

    return send_from_directory(target.parent, target.name)


@app.errorhandler(404)
def not_found(_error):
    return "<h2>404 - Página no encontrada</h2><p><a href='/'>Volver a GLOWTEX</a></p>", 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)
