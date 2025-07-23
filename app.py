from flask import Flask, render_template, request, redirect, session, flash
import sqlite3
from flask import jsonify

app = Flask(__name__)
app.secret_key = '123123123'

def get_db_connection():
    conn = sqlite3.connect('usuarios.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            correo TEXT NOT NULL UNIQUE,
            contraseña TEXT NOT NULL,
            genero TEXT NOT NULL
        )
    ''')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS servicios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            autor TEXT NOT NULL,
            precio REAL NOT NULL,
            duracion TEXT,
            a_domicilio TEXT NOT NULL,
            imagen TEXT,
            categoria TEXT
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

@app.route("/catalogo.html")
def catalogo():
    usuario = session.get('usuario')
    conn = get_db_connection()
    servicios = conn.execute('SELECT * FROM servicios').fetchall()
    conn.close()
    return render_template('catalogo.html', servicios=servicios, usuario = usuario)

@app.route("/cargaServicio.html")
def cargaServicio():
    usuario = session.get('usuario')
    return render_template('cargaServicio.html', usuario=usuario)













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
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO servicios (titulo, descripcion, autor, precio, duracion, a_domicilio, imagen, categoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (
            data['titulo'],
            data['descripcion'],
            usuario,
            float(data['precio']),
            data.get('duracion'),
            data['a_domicilio'],
            data.get('imagen', ''),
            data['categoria']
        )
    )
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/servicios/<int:id>", methods=["PUT"])
def api_editar_servicio(id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE servicios SET titulo=?, descripcion=?, precio=?, duracion=?, a_domicilio=?, imagen=?, categoria=? WHERE id=?',
        (
            data['titulo'],
            data['descripcion'],
            float(data['precio']),
            data.get('duracion'),
            data['a_domicilio'],
            data.get('imagen', ''),
            data['categoria'],
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

if __name__ == '__main__':  
   app.run(host="0.0.0.0", port=80, debug=True)
