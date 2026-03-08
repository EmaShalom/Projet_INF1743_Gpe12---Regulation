import { useEffect, useState } from "react";
import api from "../services/api";

export default function TestPage() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get("/test")
      .then((res) => {
        setMessage(res.data.message);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div>
      <h1>Test API</h1>
      <p>{message}</p>
    </div>
  );
}