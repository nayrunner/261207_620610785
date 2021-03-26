const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const courses = require('./myCourses');
const { response } = require("express");
//to post you must use bodyParser

app.use(express.static("assets"));
app.use(bodyParser.json())

app.get("/", (req, res) => {
  res.end(fs.readFileSync("./instruction.html"));
});

//implement your api here
//follow instruction in http://localhost:8000/
const calc = () => {
  let gpax = courses.courses.map(course => {
    return {
      gpa: Number(course.gpa) * Number(course.credit),
      credit: Number(course.credit)
    }
  })
    .reduce((sum, course) => {
      return {
        gpa: course.gpa + sum.gpa,
        credit: course.credit + sum.credit
      }
    }, { gpa: 0, credit: 0 })
  console.log(gpax)
  courses.gpax = (gpax.gpa / gpax.credit).toFixed(2)
  console.log(courses.gpax)
}

const writeJSON = () => {
  let db = JSON.stringify(courses, null, 2)
  fs.writeFileSync('myCourses.json', db)
}

const sync = () => {
  calc()
  writeJSON()
}

/**
 * Get all courses
 */
app.get("/courses", (req, res) => {
  res.json({ success: true, data: courses })
});

/**
 * Get course by courseID
 */
app.get("/courses/:id", (req, res) => {
  const course = courses.courses.find(course => course.courseId == req.params.id)
  const responseObj = { success: true, data: course }
  if (course != null) {
    res.status(200).json(responseObj)
  }
  else {
    res.status(404).json({ success: false, data: null })
  }
});

/**
 * Delete course by courseID
 */
app.delete("/courses/:id", (req, res) => {
  let size = courses.courses.length
  courses.courses = courses.courses.filter(course => course.courseId != req.params.id)
  if (courses.courses.length < size) {
    sync()
    res.status(200).json({ success: true, data: courses.courses })
  }
  else {
    res.status(404).json({ success: false, data: courses.courses })
  }
})

/**
 * Post new course
 */
app.post("/addCourse", (req, res) => {
  console.log(req.body)
  const { courseId, courseName, credit, gpa } = req.body
  if (courseId !== undefined && courseName !== undefined &&
    credit !== undefined && gpa !== undefined) {
    const newCourse = {
      courseId: courseId,
      courseName: courseName,
      credit: credit,
      gpa: gpa
    }
    courses.courses.push(newCourse)
    sync()
    res.status(201).send({ success: true, data: newCourse })
  }
  else {
    res.status(422).send({ success: false, error: "ข้อมูลไม่ครบ" })
  }
})

const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`server started on port:${port}`));
