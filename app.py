from flask import Flask, render_template, request, redirect, session, flash
import sqlite3

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
            duracion TEXT NOT NULL,
            a_domicilio TEXT NOT NULL,
            imagen TEXT
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

@app.route("/cargaServicio.html", methods=["GET", "POST"])
def cargaServicio():
    usuario = session.get('usuario')
    if request.method == "POST":
        titulo = request.form['service-title']
        descripcion = request.form['service-description']
        precio = request.form['service-price']
        duracion = request.form['service-duration']
        a_domicilio = request.form.get('service-delivery')

        if a_domicilio == 'on':
            a_domicilio = 'Si'
        else:
            a_domicilio = 'No'

        conn = get_db_connection()
        try:
            conn.execute(
                'INSERT INTO servicios (titulo, descripcion, autor, precio, duracion, a_domicilio) VALUES (?, ?, ?, ?, ?, ?)',
                (titulo, descripcion, usuario, float(precio), duracion, a_domicilio)
            )
            conn.commit()
            flash("Registro exitoso.")
        except sqlite3.IntegrityError as e:
            print("Error de integridad:", e)
            print(titulo, descripcion, usuario, precio, duracion, a_domicilio)
            flash("Error desconocido.")
        finally:
            conn.close()
    conn = get_db_connection()
    servicios = conn.execute('SELECT * FROM servicios WHERE autor = ?',
        (usuario,)
        ).fetchall()
    conn.close()
    return render_template('cargaServicio.html', servicios=servicios, usuario=usuario)

if __name__ == '__main__':  
   app.run(host="0.0.0.0", port=80, debug=True)
