from flask import Flask, g, render_template, request, redirect, session, flash
import sqlite3
from flask import jsonify
import os
from werkzeug.utils import secure_filename
import unicodedata

app = Flask(__name__)
app.secret_key = '123123123'

DATABASE = 'usuarios.db'
UPLOAD_FOLDER = 'static/images/files'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def get_db_connection():
    if 'db' not in g:
        conn = sqlite3.connect(
            DATABASE,
            timeout=30,
            check_same_thread=False
        )
        conn.row_factory = sqlite3.Row
        conn.execute('PRAGMA journal_mode=WAL;')
        conn.execute('PRAGMA busy_timeout = 30000;')
        g.db = conn
    return g.db

@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        conn = get_db_connection()
        conn.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            correo TEXT NOT NULL UNIQUE,
            contraseña TEXT NOT NULL,
            genero TEXT NOT NULL,
            foto TEXT,
            descripcion TEXT
        )
        ''')
        conn.execute('''
        CREATE TABLE IF NOT EXISTS servicios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            autor TEXT NOT NULL,
            precio REAL NOT NULL,
            a_domicilio TEXT NOT NULL,
            imagen TEXT,
            categoria TEXT
        )
        ''')
        conn.execute('''
        CREATE TABLE IF NOT EXISTS reservas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT NOT NULL,
            servicio_id INTEGER NOT NULL,
            fecha TEXT NOT NULL,
            hora TEXT NOT NULL,
            FOREIGN KEY(servicio_id) REFERENCES servicios(id)
        )
        ''')
        conn.commit()
        conn.close()

init_db()

@app.route("/")
@app.route("/index.html")
def index():
	usuario = session.get('usuario')
	return render_template('index.html', usuario=usuario)

@app.route("/user_page.html", methods=["GET", "POST"])
def user_page():
    nombre_usuario = session.get('usuario')
    if not nombre_usuario:
        return render_template('user_page.html', usuario=None)

    conn = get_db_connection()
    usuario = conn.execute('SELECT * FROM usuarios WHERE nombre = ?', (nombre_usuario,)).fetchone()

    if request.method == "POST":
        descripcion = request.form.get('user-description', '')
        correo = request.form.get('correo')
        foto = request.files.get('foto')
        foto_url = usuario['foto'] if usuario and usuario['foto'] else '/static/images/default.jpg'

        if foto and foto.filename:
            filename = secure_filename(foto.filename)
            os.makedirs('static/images/files', exist_ok=True)
            foto.save(os.path.join('static/images/files', filename))
            foto_url = f'/static/images/files/{filename}'

        conn.execute(
            'UPDATE usuarios SET foto=?, descripcion=?, correo=? WHERE nombre=?',
            (foto_url, descripcion, correo, nombre_usuario)
        )
        conn.commit()
        usuario = conn.execute('SELECT * FROM usuarios WHERE nombre = ?', (nombre_usuario,)).fetchone()

    conn.close()

    if usuario:
        usuario_dict = dict(usuario)
        usuario_dict['foto'] = usuario_dict.get('foto', '/static/images/default.jpg')
        return render_template('user_page.html', usuario=usuario_dict)
    else:
        return render_template('user_page.html', usuario=None)


@app.route("/registro.html", methods=["GET", "POST"])
def registro():
    if request.method == "POST":
        nombre = request.form['nombreusuario']
        correo = request.form['correo']
        contraseña = request.form['contraseña']
        genero = request.form['genero']
        conn = get_db_connection()
        try:
            conn.execute(
                'INSERT INTO usuarios (nombre, correo, contraseña, genero) VALUES (?, ?, ?, ?)',
                (nombre, correo, contraseña, genero)
            )
            conn.commit()
            session['usuario'] = nombre
            flash("Registro exitoso.")
            return redirect('/')
        except sqlite3.IntegrityError:
            flash("El correo ya está registrado.")
            return redirect('/registro.html')
        finally:
            conn.close()
    return render_template('registro.html')

@app.route("/login.html", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        correo = request.form['correo']
        contraseña = request.form['contraseña']
        conn = get_db_connection()
        usuario = conn.execute(
            'SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?',
            (correo, contraseña)
        ).fetchone()
        conn.close()
        if usuario:
            session['usuario'] = usuario['nombre']
            flash("Inicio de sesión exitoso.")
            return redirect('/')
        else:
            flash("Correo o contraseña incorrectos.")
            return redirect('/login.html')
    return render_template('login.html')

@app.route("/cerrar-sesion")
def cerrar_sesion():
    session['usuario'] = None
    return redirect('/login.html')

@app.route("/catalogo.html")
def catalogo():
    usuario = session.get('usuario')
    categoria = request.args.get('categoria', '')
    busqueda = request.args.get('busqueda', '').strip()
    busqueda_normalizada = quitar_acentos(busqueda.lower())
    conn = get_db_connection()
    query = 'SELECT * FROM servicios WHERE 1=1'
    params = []

    if categoria:
        query += ' AND categoria = ?'
        params.append(categoria)
    if busqueda:
        query += ' AND (lower(titulo) LIKE ? OR lower(descripcion) LIKE ? OR lower(?) LIKE lower(titulo) OR lower(?) LIKE lower(descripcion))'
        params.extend([f'%{busqueda_normalizada}%', f'%{busqueda_normalizada}%', busqueda, busqueda])

    query += ' ORDER BY id DESC'
    servicios = conn.execute(query, params).fetchall()
    conn.close()
    return render_template('catalogo.html', servicios=servicios, usuario=usuario)

@app.route("/cargaServicio.html")
def cargaServicio():
    usuario = session.get('usuario')
    return render_template('cargaServicio.html', usuario=usuario)

@app.route("/servicio/<int:id>")
def servicio(id):
    usuario = session.get('usuario')
    conn = get_db_connection()
    servicio = conn.execute('SELECT * FROM servicios WHERE id = ?', (id,)).fetchone()
    conn.close()
    if servicio:
        return render_template('servicios.html', servicio=servicio, usuario=usuario)
    else:
        flash("Servicio no encontrado.")
        return redirect('/catalogo.html')











def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/api/servicios", methods=["GET"])
def api_listar_servicios():
    usuario = session.get('usuario')
    conn = get_db_connection()
    servicios = conn.execute('SELECT * FROM servicios WHERE autor = ?', (usuario,)).fetchall()
    conn.close()
    return jsonify([dict(s) for s in servicios])

@app.route("/api/servicios", methods=["POST"])
def api_agregar_servicio():
    usuario = session.get('usuario')
    titulo = request.form['service-title']
    descripcion = request.form['service-description']
    precio = float(request.form['service-price'])
    a_domicilio = request.form['a_domicilio']
    categoria = request.form['service-category']
    imagen = request.files.get('imagen')
    imagen_url = ''

    if imagen and allowed_file(imagen.filename):
        filename = secure_filename(imagen.filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        imagen_url = f'/static/images/files/{filename}'

    conn = get_db_connection()
    conn.execute(
        'INSERT INTO servicios (titulo, descripcion, autor, precio, a_domicilio, imagen, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (
            titulo,
            descripcion,
            usuario,
            precio,
            a_domicilio,
            imagen_url,
            categoria
        )
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/servicios/<int:id>", methods=["PUT"])
def api_editar_servicio(id):
    usuario = session.get('usuario')
    titulo = request.form['service-title']
    descripcion = request.form['service-description']
    precio = float(request.form['service-price'])
    a_domicilio = request.form['a_domicilio']
    categoria = request.form['service-category']
    imagen = request.files.get('imagen')
    imagen_url = ''

    if imagen and allowed_file(imagen.filename):
        filename = secure_filename(imagen.filename)
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        imagen.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        imagen_url = f'/static/images/files/{filename}'

    conn = get_db_connection()
    if imagen_url != '':
        conn.execute(
            'UPDATE servicios SET titulo=?, descripcion=?, precio=?, a_domicilio=?, imagen=?, categoria=? WHERE id=?',
            (
                titulo,
                descripcion,
                precio,
                a_domicilio,
                imagen_url,
                categoria,
                id
            )
        )
    else:
        conn.execute(
            'UPDATE servicios SET titulo=?, descripcion=?, precio=?, a_domicilio=?, categoria=? WHERE id=?',
            (
                titulo,
                descripcion,
                precio,
                a_domicilio,
                categoria,
                id
            )
        )
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/servicios/<int:id>", methods=["DELETE"])
def api_eliminar_servicio(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM servicios WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/reservas", methods=["POST"])
def api_crear_reserva():
    usuario = session.get('usuario')
    data = request.json
    servicio_id = data['servicio_id']
    fecha = data['fecha']
    hora = data['hora']
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO reservas (usuario, servicio_id, fecha, hora) VALUES (?, ?, ?, ?)',
        (usuario, servicio_id, fecha, hora)
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/horarios", methods=["POST"])
def api_crear_horario():
    usuario = session.get('usuario')
    data = request.json
    servicio_id = data['servicio_id']
    
    conn = get_db_connection()
    for reserva in data['horarios']:
        fecha = reserva['fecha']
        hora = reserva['hora']
        conn.execute(
            'INSERT INTO reservas (usuario, servicio_id, fecha, hora) VALUES (?, ?, ?, ?)',
            (usuario, servicio_id, fecha, hora)
        )
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/reservas", methods=["GET"])
def api_listar_reservas():
    usuario = session.get('usuario')
    conn = get_db_connection()
    reservas = conn.execute(
        'SELECT * FROM reservas WHERE usuario = ?', (usuario,)
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in reservas])

@app.route("/api/reservas/<int:id>", methods=["GET"])
def api_listar_reservas_servicio(id):
    conn = get_db_connection()
    reservas = conn.execute(
        'SELECT * FROM reservas WHERE servicio_id = ?', (id,)
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in reservas])

@app.route("/api/reservas/<int:id>", methods=["DELETE"])
def api_eliminar_reserva(id):
    usuario = session.get('usuario')
    conn = get_db_connection()
    conn.execute('DELETE FROM reservas WHERE id=? AND usuario=?', (id, usuario))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

def quitar_acentos(texto):
    return ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn')

if __name__ == '__main__':  
   app.run(host="0.0.0.0", port=80, debug=True)
