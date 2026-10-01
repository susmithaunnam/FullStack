import { useEffect, useState } from "react";

const API = "http://localhost:5000";

function App() {

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    gender: "",
    country: "",
    languages: []
  };

  const [form, setForm] = useState(emptyForm);
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState("");

  // Get students when page loads
  useEffect(() => {
    loadStudents();
  }, []);

  function loadStudents() {
    fetch(API + "/students")
      .then(response => response.json())
      .then(data => {
        setStudents(data);
      })
      .catch(error => {
        console.log(error);
        setMessage("Could not connect to server");
      });
  }

  // Handles text, email, password, radio and select
  function handleChange(event) {
    const { name, value } = event.target;

    setForm({
      ...form,
      [name]: value
    });
  }

  // Handles language checkboxes
  function handleLanguage(event) {
    const value = event.target.value;
    const checked = event.target.checked;

    let languages = form.languages;

    if (checked) {
      languages = [...languages, value];
    } else {
      languages = languages.filter(item => item !== value);
    }

    setForm({
      ...form,
      languages: languages
    });
  }

  // Register or update student
  function saveStudent(event) {
    event.preventDefault();

    let url = API + "/students";
    let method = "POST";

    if (editId !== "") {
      url = API + "/students/" + editId;
      method = "PUT";
    }

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        setForm(emptyForm);
        setEditId("");
        loadStudents();
      })
      .catch(error => {
        console.log(error);
        setMessage("Could not connect to Express");
      });
  }

  // Put selected student data into form
  function editStudent(student) {
    setForm({
      name: student.name,
      email: student.email,
      password: student.password,
      gender: student.gender,
      country: student.country,
      languages: student.languages
    });

    setEditId(student._id);
    setMessage("Edit the data and click Update");
  }

  // Delete student
  function deleteStudent(id) {
    fetch(API + "/students/" + id, {
      method: "DELETE"
    })
      .then(response => response.json())
      .then(data => {
        setMessage(data.message);
        loadStudents();
      });
  }

  // Clear form
  function resetForm() {
    setForm(emptyForm);
    setEditId("");
    setMessage("");
  }

  return (
    <div>

      <h1>Student Registration</h1>

      <form onSubmit={saveStudent}>

        <label>Name</label>
        <br />
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <br /><br />

        <label>Email</label>
        <br />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <br /><br />

        <label>Password</label>
        <br />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <br /><br />

        <label>Gender</label>
        <br />

        <input
          type="radio"
          name="gender"
          value="Male"
          checked={form.gender === "Male"}
          onChange={handleChange}
        />
        Male

        <input
          type="radio"
          name="gender"
          value="Female"
          checked={form.gender === "Female"}
          onChange={handleChange}
        />
        Female

        <br /><br />

        <label>Country</label>
        <br />

        <select
          name="country"
          value={form.country}
          onChange={handleChange}
          required
        >
          <option value="">Select Country</option>
          <option value="India">India</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
          <option value="Australia">Australia</option>
        </select>

        <br /><br />

        <label>Languages</label>
        <br />

        <input
          type="checkbox"
          value="English"
          checked={form.languages.includes("English")}
          onChange={handleLanguage}
        />
        English

        <input
          type="checkbox"
          value="Hindi"
          checked={form.languages.includes("Hindi")}
          onChange={handleLanguage}
        />
        Hindi

        <input
          type="checkbox"
          value="Telugu"
          checked={form.languages.includes("Telugu")}
          onChange={handleLanguage}
        />
        Telugu

        <br /><br />

        <button type="submit">
          {editId === "" ? "Register" : "Update"}
        </button>

        <button type="button" onClick={resetForm}>
          Reset
        </button>

      </form>

      <p>{message}</p>

      <hr />

      <h2>Registered Students</h2>

      <table border="1" cellPadding="8">

        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Gender</th>
            <th>Country</th>
            <th>Languages</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {students.map(student => (
            <tr key={student._id}>

              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>{student.gender}</td>
              <td>{student.country}</td>
              <td>{student.languages.join(", ")}</td>

              <td>
                <button onClick={() => editStudent(student)}>
                  Edit
                </button>

                <button onClick={() => deleteStudent(student._id)}>
                  Delete
                </button>
              </td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default App;