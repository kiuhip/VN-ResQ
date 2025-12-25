
import axios from 'axios';

async function testDeleteComplex() {
    try {
        console.log("--- Starting Complex Delete Test (Retry) ---");

        // 1. Get a team
        const teamsRes = await axios.get('http://localhost:3000/api/teams');
        const team = teamsRes.data[0];
        if (!team) throw new Error("No teams available");
        console.log("Using team:", team.id);

        // 2. Force Idle
        await axios.post(`http://localhost:3000/api/teams/${team.id}/status`, { status: "idle" });
        console.log("Forced team to idle");

        // 3. Create Incident
        const incidentRes = await axios.post('http://localhost:3000/api/incidents', {
            text: "Complex incident with assignment",
            source: "test_script"
        });
        const incidentId = incidentRes.data.id;
        console.log("Created incident:", incidentId);

        // 4. Dispatch Team (create assignment)
        console.log("Dispatching team...");
        await axios.post('http://localhost:3000/api/dispatch', { incidentId: incidentId });
        console.log("Dispatch successful");

        // 5. Try delete
        console.log("Deleting assigned incident...");
        const deleteRes = await axios.delete(`http://localhost:3000/api/incidents/${incidentId}`);
        console.log("Delete result:", deleteRes.data);

    } catch (error: any) {
        console.error("Error Failed:", error.response?.data || error.message);
    }
}

testDeleteComplex();
