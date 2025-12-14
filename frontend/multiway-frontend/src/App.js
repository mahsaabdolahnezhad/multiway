import { useState } from "react";
import axios from "axios";

function App() {
  const [pythonData, setPythonData] = useState(null);
  const [javaData, setJavaData] = useState(null);
  const [rustData, setRustData] = useState(null);

  const API = {
    python: "http://localhost:8001",
    java: "http://localhost:8080",
    rust: "http://localhost:8002"
  };

  // ----- CHECK HEALTH -----
  const check = async (service) => {
    try {
      const res = await axios.get(`${API[service]}/`);
      alert(`${service.toUpperCase()} OK: ` + JSON.stringify(res.data));
    } catch (err) {
      alert(`${service.toUpperCase()} ERROR`);
    }
  };

  // ----- SAVE DATA -----
  const save = async (service) => {
    const data = { name: "Mahsa", time: Date.now() };
    try {
      await axios.post(`${API[service]}/save`, data);
      alert(`Saved to ${service}`);
    } catch {
      alert(`Save FAILED for ${service}`);
    }
  };

  // ----- LOAD DATA -----
  const load = async (service) => {
    try {
      const res = await axios.get(`${API[service]}/load`);
      if (service === "python") setPythonData(res.data);
      if (service === "java") setJavaData(res.data);
      if (service === "rust") setRustData(res.data);
    } catch {
      alert(`Load FAILED for ${service}`);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Multi-Service Test Frontend</h1>

      <ServiceCard
        name="Python (FastAPI)"
        onCheck={() => check("python")}
        onSave={() => save("python")}
        onLoad={() => load("python")}
        data={pythonData}
      />

      <ServiceCard
        name="Java (Spring)"
        onCheck={() => check("java")}
        onSave={() => save("java")}
        onLoad={() => load("java")}
        data={javaData}
      />

      <ServiceCard
        name="Rust (Actix)"
        onCheck={() => check("rust")}
        onSave={() => save("rust")}
        onLoad={() => load("rust")}
        data={rustData}
      />
    </div>
  );
}

function ServiceCard({ name, onCheck, onSave, onLoad, data }) {
  return (
    <div
      style={{
        border: "1px solid #999",
        borderRadius: 10,
        padding: 15,
        marginBottom: 20
      }}
    >
      <h2>{name}</h2>
      <button onClick={onCheck}>Check</button>
      <button onClick={onSave}>Save</button>
      <button onClick={onLoad}>Load</button>

      {data && (
        <pre style={{ background: "#eee", padding: 10, marginTop: 10 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
