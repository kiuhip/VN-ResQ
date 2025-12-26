const fetch = require("node-fetch"); // or use built-in in node 18+

async function run() {
  try {
    // 1. Create
    const createRes = await fetch("http://localhost:3000/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Test Delete JS" }),
    });
    const created = await createRes.json();
    console.log("Created ID:", created.id);

    if (!created.id) throw new Error("Create failed");

    // 2. Delete
    const delRes = await fetch(
      `http://localhost:3000/api/incidents/${created.id}`,
      {
        method: "DELETE",
      }
    );

    if (delRes.ok) {
      console.log("DELETE Success:", await delRes.text());
    } else {
      console.log("DELETE Failed:", delRes.status, await delRes.text());
    }
  } catch (e) {
    console.error(e);
  }
}

run();
