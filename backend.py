from flask import Flask,render_template
from flask_cors import CORS
app= Flask(__name__)

CORS(app)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/')
def logIn():
        return render_template('paratrooper_readiness.html')
 
@app.route('/login')
def _login():
        return logIn();
@app.route('/data')
def _jsonfile():
        return render_template('aic_dummy_data.csv');

if __name__ == '__main__':
        app.run(debug=True)

