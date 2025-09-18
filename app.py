from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def dashboard():
    return render_template("dashboard.html")

@app.route("/add-student")
def add_student():
    return render_template("add_student.html")

# (Add the rest later for update_student, add_college, etc.)

if __name__ == "__main__":
    app.run(debug=True)