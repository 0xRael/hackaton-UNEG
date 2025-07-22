from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def index():
	return render_template('index.html')

@app.route("/catalogo.html")
def catalogo():
	return render_template('catalogo.html')

@app.route("/registro.html")
def registro():
	return render_template('registro.html')

@app.route("/login.html")
def login():
	return render_template('login.html')

if __name__ == '__main__':  
   app.run(host="0.0.0.0", port=80, debug=True)  