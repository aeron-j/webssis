from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

@app.route("/")
def dashboard():
    return render_template("dashboard.html")

@app.route("/add_student", methods=["GET", "POST"])
def add_student():
    if request.method == "POST":
        student_id = request.form["student_id"]
        first_name = request.form["first_name"]
        last_name = request.form["last_name"]
        course = request.form["course"]
        # TODO: Save to database here
        print(student_id, first_name, last_name, course)
        return redirect(url_for("dashboard"))
    return render_template("add_student.html")

@app.route("/update_student", methods=["GET", "POST"])
def update_student():
    if request.method == "POST":
        # TODO: Handle update here (same as add_student but update existing data)
        student_id = request.form["student_id"]
        first_name = request.form["first_name"]
        last_name = request.form["last_name"]
        course = request.form["course"]
        print("Updating:", student_id, first_name, last_name, course)
        return redirect(url_for("dashboard"))
    return render_template("update_student.html")