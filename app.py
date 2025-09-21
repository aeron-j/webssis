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

@app.route("/manage_college")
def manage_college():
    colleges = [
        {"code": "CENG", "name": "College of Engineering"},
        {"code": "CBA", "name": "College of Business Administration"},
    ]
    total_college = len(colleges)
    return render_template("manage_college.html", colleges=colleges, total_college=total_college)

@app.route("/add_college", methods=["GET", "POST"])
def add_college():
    if request.method == "POST":
        college_code = request.form["college_code"]
        college_name = request.form["college_name"]
        # TODO: Save to database
        print(college_code, college_name)
        return redirect(url_for("manage_college"))
    return render_template("add_college.html")

@app.route("/update_college", methods=["GET", "POST"])
def update_college():
    if request.method == "POST":
        college_code = request.form["college_code"]
        college_name = request.form["college_name"]
        # TODO: Update database here
        print("Updated:", college_code, college_name)
        return redirect(url_for("manage_college"))
    return render_template("update_college.html")